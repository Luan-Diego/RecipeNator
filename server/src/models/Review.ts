import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

// Uma avaliação por usuário em cada receita (enviar de novo atualiza a anterior)
reviewSchema.index({ recipe: 1, user: 1 }, { unique: true });

export const Review = model('Review', reviewSchema);
