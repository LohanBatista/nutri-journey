import type {
  LabResult,
  CreateLabResultInput as DomainCreateLabResultInput,
} from "@/domain/entities/LabResult";
import type { LabResultRepository } from "@/domain/repositories/LabResultRepository";

export interface CreateLabResultInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  testType: "GLYCEMIA" | "HBA1C" | "CT" | "HDL" | "LDL" | "TG" | "OTHER";
  name: string;
  value: number | string;
  unit: string;
  referenceRange?: string | null;
  notes?: string | null;
}

export interface CreateLabResultOutput {
  labResult: LabResult;
}

export class CreateLabResultUseCase {
  constructor(private readonly labResultRepository: LabResultRepository) {}

  async execute(input: CreateLabResultInput): Promise<CreateLabResultOutput> {
    const labResultData: DomainCreateLabResultInput = {
      organizationId: input.organizationId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      date: input.date,
      testType: input.testType,
      name: input.name,
      value: input.value,
      unit: input.unit,
      referenceRange: input.referenceRange ?? null,
      notes: input.notes ?? null,
    };

    const labResult = await this.labResultRepository.create(labResultData);

    return { labResult };
  }
}
