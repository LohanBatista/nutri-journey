import { ListNutritionPlansUseCase } from "../use-cases/ListNutritionPlans";
import { PrismaNutritionPlanRepository } from "@/infra/repositories/PrismaNutritionPlanRepository";

export function makeListNutritionPlansUseCase(): ListNutritionPlansUseCase {
  const nutritionPlanRepository = new PrismaNutritionPlanRepository();
  return new ListNutritionPlansUseCase(nutritionPlanRepository);
}
