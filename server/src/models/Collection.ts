import { Schema, model } from 'mongoose';

/** Coleção pessoal de receitas (ex.: "Jantares de semana", "Para o Natal"). */
const collectionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    recipes: { type: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }], default: [] },
  },
  { timestamps: true },
);

export const Collection = model('Collection', collectionSchema);
