import { UpdateNutritionPlanUseCase } from "../use-cases/UpdateNutritionPlan";
import { PrismaNutritionPlanRepository } from "@/infra/repositories/PrismaNutritionPlanRepository";

export function makeUpdateNutritionPlanUseCase(): UpdateNutritionPlanUseCase {
  const nutritionPlanRepository = new PrismaNutritionPlanRepository();
  return new UpdateNutritionPlanUseCase(nutritionPlanRepository);
}
