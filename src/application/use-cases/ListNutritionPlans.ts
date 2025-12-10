import type { NutritionPlan } from "@/domain/entities/NutritionPlan";
import type { NutritionPlanRepository } from "@/domain/repositories/NutritionPlanRepository";

export interface ListNutritionPlansInput {
  patientId: string;
  organizationId: string;
}

export interface ListNutritionPlansOutput {
  nutritionPlans: NutritionPlan[];
}

export class ListNutritionPlansUseCase {
  constructor(
    private readonly nutritionPlanRepository: NutritionPlanRepository
  ) {}

  async execute(
    input: ListNutritionPlansInput
  ): Promise<ListNutritionPlansOutput> {
    const nutritionPlans = await this.nutritionPlanRepository.listByPatient(
      input.patientId,
      input.organizationId
    );

    return { nutritionPlans };
  }
}
