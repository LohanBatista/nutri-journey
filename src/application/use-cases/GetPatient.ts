import type { Patient } from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";

export interface GetPatientInput {
  id: string;
  organizationId: string;
}

export interface GetPatientOutput {
  patient: Patient;
}

export class GetPatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: GetPatientInput): Promise<GetPatientOutput> {
    const patient = await this.patientRepository.findById(
      input.id,
      input.organizationId
    );

    if (!patient) {
      throw new Error("Patient not found");
    }

    return { patient };
  }
}

