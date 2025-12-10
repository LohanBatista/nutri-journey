export type MealType =
  | "BREAKFAST"
  | "MORNING_SNACK"
  | "LUNCH"
  | "AFTERNOON_SNACK"
  | "DINNER"
  | "SUPPER"
  | "OTHER";

export interface NutritionPlanMeal {
  id: string;
  nutritionPlanId: string;
  mealType: MealType;
  description: string;
  observation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionPlan {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  title: string;
  goals: string;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  meals?: NutritionPlanMeal[];
}

export interface CreateNutritionPlanInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  title: string;
  goals: string;
  notes?: string | null;
  isActive?: boolean;
  meals?: CreateNutritionPlanMealInput[];
}

export interface CreateNutritionPlanMealInput {
  mealType: MealType;
  description: string;
  observation?: string | null;
}

export interface UpdateNutritionPlanInput {
  title?: string;
  goals?: string;
  notes?: string | null;
  isActive?: boolean;
}

export interface UpdateNutritionPlanMealInput {
  mealType?: MealType;
  description?: string;
  observation?: string | null;
}
