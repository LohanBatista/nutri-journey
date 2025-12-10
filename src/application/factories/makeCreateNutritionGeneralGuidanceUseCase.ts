import { CreateNutritionGeneralGuidanceUseCase } from "../use-cases/CreateNutritionGeneralGuidance";
import { PrismaNutritionGeneralGuidanceRepository } from "@/infra/repositories/PrismaNutritionGeneralGuidanceRepository";

export function makeCreateNutritionGeneralGuidanceUseCase(): CreateNutritionGeneralGuidanceUseCase {
  const nutritionGeneralGuidanceRepository =
    new PrismaNutritionGeneralGuidanceRepository();
  return new CreateNutritionGeneralGuidanceUseCase(
    nutritionGeneralGuidanceRepository
  );
}
