import type {
  NutritionGeneralGuidance,
  CreateNutritionGeneralGuidanceInput as DomainCreateNutritionGeneralGuidanceInput,
} from "@/domain/entities/NutritionGeneralGuidance";
import type { NutritionGeneralGuidanceRepository } from "@/domain/repositories/NutritionGeneralGuidanceRepository";

export interface CreateNutritionGeneralGuidanceInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  hydrationGuidance?: string | null;
  physicalActivityGuidance?: string | null;
  sleepGuidance?: string | null;
  symptomManagementGuidance?: string | null;
  notes?: string | null;
}

export interface CreateNutritionGeneralGuidanceOutput {
  nutritionGeneralGuidance: NutritionGeneralGuidance;
}

export class CreateNutritionGeneralGuidanceUseCase {
  constructor(
    private readonly nutritionGeneralGuidanceRepository: NutritionGeneralGuidanceRepository
  ) {}

  async execute(
    input: CreateNutritionGeneralGuidanceInput
  ): Promise<CreateNutritionGeneralGuidanceOutput> {
    const guidanceData: DomainCreateNutritionGeneralGuidanceInput = {
      organizationId: input.organizationId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      date: input.date,
      hydrationGuidance: input.hydrationGuidance ?? null,
      physicalActivityGuidance: input.physicalActivityGuidance ?? null,
      sleepGuidance: input.sleepGuidance ?? null,
      symptomManagementGuidance: input.symptomManagementGuidance ?? null,
      notes: input.notes ?? null,
    };

    const nutritionGeneralGuidance =
      await this.nutritionGeneralGuidanceRepository.create(guidanceData);

    return { nutritionGeneralGuidance };
  }
}
