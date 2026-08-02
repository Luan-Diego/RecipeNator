import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { z } from 'zod';
import { categories } from '../config/categories.js';
import { isAllowedImageUrl } from '../config/cloudinary.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { Recipe } from '../models/Recipe.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';

const router = Router();

const categoryEnum = z.enum(categories.map((c) => c.slug) as [string, ...string[]]);

const listQuery = z.object({
  category: categoryEnum.optional(),
  diet: z.enum(['vegetariana', 'vegana']).optional(),
  cuisine: z.string().trim().min(1).max(40).optional(),
  tag: z.string().trim().min(1).max(30).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  featured: z.enum(['true', 'false']).optional(),
  sort: z.enum(['title', 'recent', 'featured']).default('title'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

// GET /api/recipes?category=massas-e-pizzas&diet=vegetariana&q=tomate&page=1
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Parâmetros inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    const { category, diet, cuisine, tag, q, featured, sort, page, limit } = parsed.data;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (diet) filter.diets = diet;
    if (cuisine) filter.cuisine = cuisine;
    if (tag) filter.tags = tag.replace(/^#/, '').toLowerCase();
    if (q) filter.$text = { $search: q };
    if (featured === 'true') filter.featured = true;
    if (featured === 'false') filter.featured = { $ne: true };

    const sortBy: Record<string, 1 | -1> =
      sort === 'recent' ? { createdAt: -1, _id: -1 } : sort === 'featured' ? { featuredOrder: 1, title: 1 } : { title: 1 };

    const [items, total] = await Promise.all([
      Recipe.find(filter)
        .select('title slug category cuisine diets imageUrl source ratingAvg ratingCount')
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    res.json({ items, page, limit, total });
  }),
);

// ---------- Busca por ingredientes ----------

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const ACCENTS: Record<string, string> = { a: 'àáâãä', e: 'èéêë', i: 'ìíîï', o: 'òóôõö', u: 'ùúûü', c: 'ç', n: 'ñ' };

/** Regex que ignora acentos e maiúsculas e casa a palavra inteira, com ou sem plural ("sal" não casa com "salsinha"). */
function termRegex(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = escaped.replace(/[aeioucn]/g, (ch) => {
    const variants = ACCENTS[ch] ?? '';
    return `[${ch}${ch.toUpperCase()}${variants}${variants.toUpperCase()}]`;
  });
  return new RegExp(`(^|[\\s(/-])${body}(s|es)?(?=$|[\\s,.;)/-])`, 'i');
}

const STOPWORDS = new Set(['de', 'da', 'do', 'com', 'tenho', 'em', 'casa']);

/** "Tenho frango, arroz e tomates" -> ['frango', 'arroz', 'tomate'] */
function parseTerms(raw: string): string[] {
  const cleaned = normalize(raw).replace(/\btenho\b|\bem casa\b/g, ' ');
  let parts = cleaned
    .split(/[,;\n+]+|\s+e\s+/)
    .map((t) => t.replace(/[^a-z0-9\s-]/g, '').trim())
    .filter(Boolean);
  // "frango arroz tomate" (sem vírgulas): separa por palavra
  if (parts.length === 1 && parts[0]!.includes(' ')) {
    parts = parts[0]!.split(/\s+/).filter((w) => !STOPWORDS.has(w));
  }
  const singular = parts
    .filter((t) => t.length >= 2 && t.length <= 30)
    .map((t) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t));
  return [...new Set(singular)].slice(0, 10);
}

// Itens que se presume ter em casa: não contam como "faltando"
const STAPLES = new Set(['sal', 'agua', 'oleo', 'azeite', 'pimenta', 'acucar', 'salt', 'water', 'oil', 'pepper', 'sugar']);
const isStaple = (name: string) => normalize(name).split(/[^a-z]+/).some((w) => STAPLES.has(w));

const byIngredientsQuery = z.object({
  items: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

// GET /api/recipes/by-ingredients?items=frango,arroz,tomate
// Ordena pelas receitas que usam mais dos seus ingredientes e que menos itens deixam faltando.
router.get(
  '/by-ingredients',
  asyncHandler(async (req, res) => {
    const parsed = byIngredientsQuery.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ message: 'Informe ao menos um ingrediente' });
    const terms = parseTerms(parsed.data.items);
    if (terms.length === 0) return res.status(400).json({ message: 'Não entendi os ingredientes. Tente: frango, arroz, tomate' });

    const regexes = terms.map(termRegex);
    const docs = await Recipe.find({ 'ingredients.name': { $in: regexes } })
      .select('title slug category cuisine diets imageUrl source ratingAvg ratingCount ingredients.name')
      .limit(300)
      .lean();

    const scored = docs.map(({ ingredients, ...card }) => {
      const names = ingredients.map((i) => i.name);
      const matched = terms.filter((_, i) => names.some((n) => regexes[i]!.test(n)));
      const needed = names.filter((n) => !isStaple(n));
      const have = needed.filter((n) => regexes.some((r) => r.test(n))).length;
      return { ...card, matched, missing: Math.max(0, needed.length - have) };
    });

    scored.sort(
      (a, b) => b.matched.length - a.matched.length || a.missing - b.missing || a.title.localeCompare(b.title, 'pt'),
    );
    res.json({ terms, total: scored.length, items: scored.slice(0, parsed.data.limit) });
  }),
);

const createSchema = z.object({
  title: z.string().trim().min(3, 'O título precisa ter pelo menos 3 caracteres').max(120),
  category: categoryEnum,
  cuisine: z.string().trim().max(40).optional(),
  diets: z.array(z.enum(['vegetariana', 'vegana'])).max(2).default([]),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Preencha o nome do ingrediente').max(80),
        measure: z.string().trim().max(40).default(''),
      }),
    )
    .min(1, 'Adicione pelo menos um ingrediente')
    .max(40),
  imageUrl: z.string().url().max(500).optional(),
  steps: z.array(z.string().trim().min(1, 'Preencha todos os passos').max(1000)).min(1, 'Adicione pelo menos um passo').max(40),
});

// No máximo 20 receitas publicadas por hora por IP
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Muitas publicações em pouco tempo. Tente de novo mais tarde.' },
});

// POST /api/recipes  (exige login)
router.post(
  '/',
  requireAuth,
  createLimiter,
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Dados inválidos', errors: parsed.error.flatten().fieldErrors });
    }
    const data = parsed.data;

    if (data.imageUrl && !isAllowedImageUrl(data.imageUrl)) {
      return res.status(400).json({ message: 'A foto precisa ter sido enviada pelo próprio RecipeNator' });
    }

    // Receita vegana também é vegetariana
    const diets = [...new Set(data.diets.includes('vegana') ? [...data.diets, 'vegetariana'] : data.diets)];
    const tags = [...new Set(data.tags.map((t) => t.replace(/^#/, '').toLowerCase()).filter(Boolean))];

    const base = slugify(data.title) || 'receita';
    let slug = base;
    for (let i = 0; i < 5 && (await Recipe.exists({ slug })); i++) {
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const recipe = await Recipe.create({
      title: data.title,
      slug,
      category: data.category,
      cuisine: data.cuisine || undefined,
      diets,
      tags,
      ingredients: data.ingredients,
      steps: data.steps,
      imageUrl: data.imageUrl ?? '',
      language: 'pt',
      source: 'user',
      sourceId: new mongoose.Types.ObjectId().toString(),
      isImported: false,
      author: res.locals.userId,
    });

    res.status(201).json({ id: String(recipe._id), slug: recipe.slug });
  }),
);

// GET /api/recipes/:slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const recipe = await Recipe.findOne({ slug: req.params.slug }).populate('author', 'name').lean();
    if (!recipe) return res.status(404).json({ message: 'Receita não encontrada' });
    res.json(recipe);
  }),
);

export default router;
