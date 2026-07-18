import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryList, createRecipe } from '../services/api';
import { fieldClass } from './Login';

type Ingredient = { name: string; measure: string };

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categoryList[0].slug);
  const [cuisine, setCuisine] = useState('');
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [tags, setTags] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', measure: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setIngredient = (i: number, patch: Partial<Ingredient>) =>
    setIngredients((list) => list.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const setStep = (i: number, value: string) => setSteps((list) => list.map((x, idx) => (idx === i ? value : x)));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { slug } = await createRecipe({
        title,
        category,
        cuisine: cuisine.trim() || undefined,
        diets: [...(vegetarian ? (['vegetariana'] as const) : []), ...(vegan ? (['vegana'] as const) : [])],
        tags: tags
          .split(/[,\s]+/)
          .map((t) => t.replace(/^#/, ''))
          .filter(Boolean),
        ingredients: ingredients.filter((x) => x.name.trim()),
        steps: steps.filter((s) => s.trim()),
      });
      navigate(`/recipes/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível publicar a receita.');
    } finally {
      setBusy(false);
    }
  }

  const small = 'rounded-full border-[1.5px] border-espresso px-4 py-2 text-[15px] font-semibold';

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <div className="eyebrow">Compartilhe</div>
      <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em]">Publicar receita</h1>
      <p className="mt-3 text-cacau">
        Conte como você prepara. A foto da receita ainda não pode ser enviada; o upload chega em uma próxima etapa.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-5 rounded-card border border-line bg-paper p-7">
          <label className="flex flex-col gap-1.5 font-semibold">
            Título
            <input
              required
              minLength={3}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${fieldClass} font-normal`}
              placeholder="Ex.: Bolo de cenoura com chocolate"
            />
          </label>
          <div className="flex flex-wrap gap-5">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 font-semibold">
              Categoria
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${fieldClass} font-normal`}>
                {categoryList.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 font-semibold">
              Culinária (opcional)
              <input
                maxLength={40}
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className={`${fieldClass} font-normal`}
                placeholder="Ex.: Brasileira"
              />
            </label>
          </div>
          <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <legend className="mb-1 font-semibold">Estilo alimentar</legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={vegetarian} onChange={(e) => setVegetarian(e.target.checked)} className="h-5 w-5 accent-herb" />
              Vegetariana
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={vegan} onChange={(e) => setVegan(e.target.checked)} className="h-5 w-5 accent-herb" />
              Vegana
            </label>
          </fieldset>
          <label className="flex flex-col gap-1.5 font-semibold">
            Hashtags (opcional)
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={`${fieldClass} font-normal`}
              placeholder="#sobremesa #rapido #festa"
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 rounded-card border border-line bg-paper p-7">
          <h2 className="text-3xl tracking-[-0.02em]">Ingredientes</h2>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-[140px] flex-[1_1_120px] flex-col gap-1 text-sm font-semibold">
                Quantidade
                <input
                  value={ing.measure}
                  maxLength={40}
                  onChange={(e) => setIngredient(i, { measure: e.target.value })}
                  className={`${fieldClass} font-normal`}
                  placeholder="2 xícaras"
                />
              </label>
              <label className="flex min-w-[200px] flex-[3_1_200px] flex-col gap-1 text-sm font-semibold">
                Ingrediente
                <input
                  value={ing.name}
                  maxLength={80}
                  onChange={(e) => setIngredient(i, { name: e.target.value })}
                  className={`${fieldClass} font-normal`}
                  placeholder="Farinha de trigo"
                />
              </label>
              <button
                type="button"
                aria-label={`Remover ingrediente ${i + 1}`}
                disabled={ingredients.length === 1}
                onClick={() => setIngredients((l) => l.filter((_, idx) => idx !== i))}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-espresso text-xl disabled:opacity-40"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={ingredients.length >= 40}
            onClick={() => setIngredients((l) => [...l, { name: '', measure: '' }])}
            className={`${small} self-start`}
          >
            + Adicionar ingrediente
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-card border border-line bg-paper p-7">
          <h2 className="text-3xl tracking-[-0.02em]">Modo de preparo</h2>
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-saffron font-display text-lg font-semibold"
              >
                {i + 1}
              </span>
              <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
                <span className="sr-only">Passo {i + 1}</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={s}
                  onChange={(e) => setStep(i, e.target.value)}
                  className={`${fieldClass} font-normal`}
                  placeholder="Descreva este passo"
                />
              </label>
              <button
                type="button"
                aria-label={`Remover passo ${i + 1}`}
                disabled={steps.length === 1}
                onClick={() => setSteps((l) => l.filter((_, idx) => idx !== i))}
                className="mt-1 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl disabled:opacity-40"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={steps.length >= 40}
            onClick={() => setSteps((l) => [...l, ''])}
            className={`${small} self-start`}
          >
            + Adicionar passo
          </button>
        </div>

        <p role="alert" className={error ? 'rounded-xl bg-[#FBE3DD] px-4 py-3 text-chili' : 'sr-only'}>
          {error}
        </p>
        <button type="submit" disabled={busy} className="btn-primary self-start disabled:opacity-60">
          {busy ? 'Publicando…' : 'Publicar receita'}
        </button>
      </form>
    </section>
  );
}
