import type {
  Patient,
  UpdatePatientInput as DomainUpdatePatientInput,
} from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";

export interface UpdatePatientInput {
  id: string;
  organizationId: string;
  fullName?: string;
  dateOfBirth?: Date;
  sex?: "MALE" | "FEMALE" | "OTHER";
  phone?: string | null;
  email?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface UpdatePatientOutput {
  patient: Patient;
}

export class UpdatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: UpdatePatientInput): Promise<UpdatePatientOutput> {
    const existingPatient = await this.patientRepository.findById(
      input.id,
      input.organizationId
    );

    if (!existingPatient) {
      throw new Error("Patient not found");
    }

    const updateData: DomainUpdatePatientInput = {};
    if (input.fullName !== undefined) updateData.fullName = input.fullName;
    if (input.dateOfBirth !== undefined)
      updateData.dateOfBirth = input.dateOfBirth;
    if (input.sex !== undefined) updateData.sex = input.sex;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const patient = await this.patientRepository.update(input.id, updateData);

    return { patient };
  }
}
