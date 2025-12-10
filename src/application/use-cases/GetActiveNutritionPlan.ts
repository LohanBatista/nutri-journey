import type { NutritionPlan } from "@/domain/entities/NutritionPlan";
import type { NutritionPlanRepository } from "@/domain/repositories/NutritionPlanRepository";

export interface GetActiveNutritionPlanInput {
  patientId: string;
  organizationId: string;
}

export interface GetActiveNutritionPlanOutput {
  nutritionPlan: NutritionPlan | null;
}

export class GetActiveNutritionPlanUseCase {
  constructor(
    private readonly nutritionPlanRepository: NutritionPlanRepository
  ) {}

  async execute(
    input: GetActiveNutritionPlanInput
  ): Promise<GetActiveNutritionPlanOutput> {
    const nutritionPlan =
      await this.nutritionPlanRepository.findActiveByPatient(
        input.patientId,
        input.organizationId
      );

    return { nutritionPlan };
  }
}
