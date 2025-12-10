import type { AnthropometryRecord, AnthropometryRecordListFilters } from "@/domain/entities/AnthropometryRecord";
import type { AnthropometryRepository } from "@/domain/repositories/AnthropometryRepository";

export interface ListPatientAnthropometryRecordsInput {
  organizationId: string;
  patientId: string;
  filters?: Omit<AnthropometryRecordListFilters, "patientId">;
}

export interface ListPatientAnthropometryRecordsOutput {
  records: AnthropometryRecord[];
}

export class ListPatientAnthropometryRecordsUseCase {
  constructor(private readonly anthropometryRepository: AnthropometryRepository) {}

  async execute(
    input: ListPatientAnthropometryRecordsInput
  ): Promise<ListPatientAnthropometryRecordsOutput> {
    const filters: AnthropometryRecordListFilters = {
      patientId: input.patientId,
      ...input.filters,
    };

    const records = await this.anthropometryRepository.listByPatient(
      input.patientId,
      input.organizationId,
      filters
    );

    return { records };
  }
}

