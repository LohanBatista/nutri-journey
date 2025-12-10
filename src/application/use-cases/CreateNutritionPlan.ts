import type {
  NutritionPlan,
  CreateNutritionPlanInput as DomainCreateNutritionPlanInput,
} from "@/domain/entities/NutritionPlan";
import type { NutritionPlanRepository } from "@/domain/repositories/NutritionPlanRepository";

export interface CreateNutritionPlanInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  title: string;
  goals: string;
  notes?: string | null;
  isActive?: boolean;
  meals?: {
    mealType:
      | "BREAKFAST"
      | "MORNING_SNACK"
      | "LUNCH"
      | "AFTERNOON_SNACK"
      | "DINNER"
      | "SUPPER"
      | "OTHER";
    description: string;
    observation?: string | null;
  }[];
}

export interface CreateNutritionPlanOutput {
  nutritionPlan: NutritionPlan;
}

export class CreateNutritionPlanUseCase {
  constructor(
    private readonly nutritionPlanRepository: NutritionPlanRepository
  ) {}

  async execute(
    input: CreateNutritionPlanInput
  ): Promise<CreateNutritionPlanOutput> {
    // Se o novo plano será ativo, desativar outros planos ativos do paciente
    if (input.isActive !== false) {
      const activePlan = await this.nutritionPlanRepository.findActiveByPatient(
        input.patientId,
        input.organizationId
      );

      if (activePlan) {
        await this.nutritionPlanRepository.update(activePlan.id, {
          isActive: false,
        });
      }
    }

    const planData: DomainCreateNutritionPlanInput = {
      organizationId: input.organizationId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      title: input.title,
      goals: input.goals,
      ...(input.notes !== undefined && { notes: input.notes }),
      isActive: input.isActive ?? true,
      ...(input.meals !== undefined && {
        meals: input.meals.map((meal) => ({
          mealType: meal.mealType,
          description: meal.description,
          ...(meal.observation !== undefined && { observation: meal.observation }),
        })),
      }),
    };

    const nutritionPlan = await this.nutritionPlanRepository.create(planData);

    return { nutritionPlan };
  }
}
