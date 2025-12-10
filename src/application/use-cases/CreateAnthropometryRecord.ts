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
    const recordData: DomainCreateAnthropometryRecordInput = {
      organizationId: input.organizationId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      date: input.date,
      weightKg: input.weightKg ?? null,
      heightM: input.heightM ?? null,
      bmi: input.bmi ?? null,
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

