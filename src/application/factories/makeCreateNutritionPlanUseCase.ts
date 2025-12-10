import { CreateNutritionPlanUseCase } from "../use-cases/CreateNutritionPlan";
import { PrismaNutritionPlanRepository } from "@/infra/repositories/PrismaNutritionPlanRepository";

export function makeCreateNutritionPlanUseCase(): CreateNutritionPlanUseCase {
  const nutritionPlanRepository = new PrismaNutritionPlanRepository();
  return new CreateNutritionPlanUseCase(nutritionPlanRepository);
}
