import { Schema, model } from 'mongoose';

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    measure: { type: String, default: '', trim: true },
  },
  { _id: false },
);

const recipeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true }, // slug em config/categories.ts
    cuisine: { type: String, default: 'Internacional' },
    diets: { type: [String], default: [], index: true }, // 'vegetariana' | 'vegana'
    tags: { type: [String], default: [] },
    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [String], default: [] },
    imageUrl: { type: String, default: '' }, // URL da fonte (hotlink); não guardamos o arquivo
    language: { type: String, default: 'en' }, // as receitas importadas vêm em inglês
    // Origem do conteúdo
    source: { type: String, required: true }, // ex.: 'themealdb'
    sourceId: { type: String, required: true },
    sourceUrl: { type: String, default: '' },
    isImported: { type: Boolean, default: true },
  },
  { timestamps: true },
);

recipeSchema.index({ source: 1, sourceId: 1 }, { unique: true });
recipeSchema.index({ title: 'text', 'ingredients.name': 'text', tags: 'text' });

export const Recipe = model('Recipe', recipeSchema);
