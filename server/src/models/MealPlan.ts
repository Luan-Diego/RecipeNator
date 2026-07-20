import { Schema, model } from 'mongoose';

const entrySchema = new Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 }, // 0 = segunda
    meal: { type: String, required: true, enum: ['cafe', 'almoco', 'jantar'] },
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    servings: { type: Number, required: true, min: 1, max: 50, default: 4 },
  },
  { _id: false },
);

const mealPlanSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: String, required: true }, // data da segunda-feira, AAAA-MM-DD
    entries: { type: [entrySchema], default: [] },
  },
  { timestamps: true },
);

// Um plano por usuário em cada semana
mealPlanSchema.index({ user: 1, week: 1 }, { unique: true });

export const MealPlan = model('MealPlan', mealPlanSchema);
