import type {
  AnthropometryRecord,
  CreateAnthropometryRecordInput as DomainCreateAnthropometryRecordInput,
} from "@/domain/entities/AnthropometryRecord";
import type { AnthropometryRepository } from "@/domain/repositories/AnthropometryRepository";

export interface CreateAnthropometryRecordInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  weightKg?: number | null;
  heightM?: number | null;
  bmi?: number | null;
  waistCircumference?: number | null;
  hipCircumference?: number | null;
  armCircumference?: number | null;
  notes?: string | null;
}

export interface CreateAnthropometryRecordOutput {
  anthropometryRecord: AnthropometryRecord;
}

export class CreateAnthropometryRecordUseCase {
  constructor(
    private readonly anthropometryRepository: AnthropometryRepository
  ) {}

  async execute(
    input: CreateAnthropometryRecordInput
  ): Promise<CreateAnthropometryRecordOutput> {
    // Converter altura de cm para m se necessário (valores > 3 são provavelmente em cm)
    let heightM = input.heightM;
    if (heightM !== null && heightM !== undefined && heightM > 3) {
      heightM = heightM / 100; // Converter cm para m
    }

    // Calcular IMC automaticamente se peso e altura estiverem disponíveis
    let calculatedBmi: number | null = input.bmi ?? null;
    if (
      input.weightKg !== null &&
      input.weightKg !== undefined &&
      input.weightKg > 0 &&
      heightM !== null &&
      heightM !== undefined &&
      heightM > 0
    ) {
      const bmiValue = input.weightKg / (heightM * heightM);
      calculatedBmi = Number(bmiValue.toFixed(2));
    }

    const recordData: DomainCreateAnthropometryRecordInput = {
      organizationId: input.organizationId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      date: input.date,
      weightKg: input.weightKg ?? null,
      heightM: heightM ?? null,
      bmi: calculatedBmi,
      waistCircumference: input.waistCircumference ?? null,
      hipCircumference: input.hipCircumference ?? null,
      armCircumference: input.armCircumference ?? null,
      notes: input.notes ?? null,
    };

    const anthropometryRecord = await this.anthropometryRepository.create(
      recordData
    );

    return { anthropometryRecord };
  }
}

