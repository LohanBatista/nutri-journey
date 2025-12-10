import type { LabResult, LabResultListFilters } from "@/domain/entities/LabResult";
import type { LabResultRepository } from "@/domain/repositories/LabResultRepository";

export interface ListPatientLabResultsInput {
  organizationId: string;
  patientId: string;
  filters?: Omit<LabResultListFilters, "patientId">;
}

export interface ListPatientLabResultsOutput {
  labResults: LabResult[];
}

export class ListPatientLabResultsUseCase {
  constructor(private readonly labResultRepository: LabResultRepository) {}

  async execute(
    input: ListPatientLabResultsInput
  ): Promise<ListPatientLabResultsOutput> {
    const filters: LabResultListFilters = {
      patientId: input.patientId,
      ...input.filters,
    };

    const labResults = await this.labResultRepository.listByPatient(
      input.patientId,
      input.organizationId,
      filters
    );

    return { labResults };
  }
}

