import type { Patient, PatientCreateInput } from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";

export interface CreatePatientInput {
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  organizationId: string;
}

export interface CreatePatientOutput {
  patient: Patient;
}

export class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: CreatePatientInput): Promise<CreatePatientOutput> {
    const patientData: PatientCreateInput = {
      name: input.name,
      organizationId: input.organizationId,
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.birthDate !== undefined && { birthDate: input.birthDate }),
    };

    const patient = await this.patientRepository.create(patientData);

    return { patient };
  }
}
