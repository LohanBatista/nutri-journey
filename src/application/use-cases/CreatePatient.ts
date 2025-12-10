import type {
  Patient,
  CreatePatientInput as DomainCreatePatientInput,
} from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";

export interface CreatePatientInput {
  organizationId: string;
  fullName: string;
  dateOfBirth: Date;
  sex: "MALE" | "FEMALE" | "OTHER";
  phone?: string | null;
  email?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface CreatePatientOutput {
  patient: Patient;
}

export class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: CreatePatientInput): Promise<CreatePatientOutput> {
    const patientData: DomainCreatePatientInput = {
      organizationId: input.organizationId,
      fullName: input.fullName,
      dateOfBirth: input.dateOfBirth,
      sex: input.sex,
      phone: input.phone ?? null,
      email: input.email ?? null,
      tags: input.tags ?? [],
      notes: input.notes ?? null,
    };

    const patient = await this.patientRepository.create(patientData);

    return { patient };
  }
}
