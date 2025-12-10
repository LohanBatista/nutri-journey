import { GetActiveNutritionPlanUseCase } from "../use-cases/GetActiveNutritionPlan";
import { PrismaNutritionPlanRepository } from "@/infra/repositories/PrismaNutritionPlanRepository";

export function makeGetActiveNutritionPlanUseCase(): GetActiveNutritionPlanUseCase {
  const nutritionPlanRepository = new PrismaNutritionPlanRepository();
  return new GetActiveNutritionPlanUseCase(nutritionPlanRepository);
}
