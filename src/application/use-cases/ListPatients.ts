import type { Patient } from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";

export interface ListPatientsInput {
  organizationId: string;
}

export interface ListPatientsOutput {
  patients: Patient[];
}

export class ListPatientsUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: ListPatientsInput): Promise<ListPatientsOutput> {
    const patients = await this.patientRepository.findByOrganizationId(
      input.organizationId
    );

    return { patients };
  }
}
