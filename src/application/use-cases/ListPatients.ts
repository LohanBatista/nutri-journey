import type { Patient, PatientListFilters } from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";

export interface ListPatientsInput {
  organizationId: string;
  filters?: PatientListFilters;
}

export interface ListPatientsOutput {
  patients: Patient[];
}

export class ListPatientsUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: ListPatientsInput): Promise<ListPatientsOutput> {
    const patients = await this.patientRepository.listByOrganization(
      input.organizationId,
      input.filters
    );

    return { patients };
  }
}
