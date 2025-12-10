import type {
  NutritionPlan,
  UpdateNutritionPlanInput as DomainUpdateNutritionPlanInput,
} from "@/domain/entities/NutritionPlan";
import type { NutritionPlanRepository } from "@/domain/repositories/NutritionPlanRepository";

export interface UpdateNutritionPlanInput {
  title?: string;
  goals?: string;
  notes?: string | null;
  isActive?: boolean;
}

export interface UpdateNutritionPlanOutput {
  nutritionPlan: NutritionPlan;
}

export class UpdateNutritionPlanUseCase {
  constructor(
    private readonly nutritionPlanRepository: NutritionPlanRepository
  ) {}

  async execute(
    id: string,
    organizationId: string,
    input: UpdateNutritionPlanInput
  ): Promise<UpdateNutritionPlanOutput> {
    const existingPlan = await this.nutritionPlanRepository.findById(
      id,
      organizationId
    );

    if (!existingPlan) {
      throw new Error("Plano nutricional não encontrado");
    }

    // Se está ativando este plano, desativar outros planos ativos do paciente
    if (input.isActive === true && !existingPlan.isActive) {
      const activePlan = await this.nutritionPlanRepository.findActiveByPatient(
        existingPlan.patientId,
        organizationId
      );

      if (activePlan && activePlan.id !== id) {
        await this.nutritionPlanRepository.update(activePlan.id, {
          isActive: false,
        });
      }
    }

    const updateData: DomainUpdateNutritionPlanInput = {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.goals !== undefined && { goals: input.goals }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    };

    const nutritionPlan = await this.nutritionPlanRepository.update(
      id,
      updateData
    );

    return { nutritionPlan };
  }
}
