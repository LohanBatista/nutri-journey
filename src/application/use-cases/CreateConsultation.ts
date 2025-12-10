import type {
  Consultation,
  CreateConsultationInput as DomainCreateConsultationInput,
} from "@/domain/entities/Consultation";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export interface CreateConsultationInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  dateTime: Date;
  type: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
  mainComplaint?: string | null;
  nutritionHistory?: string | null;
  clinicalHistory?: string | null;
  objectiveData?: string | null;
  nutritionDiagnosis?: string | null;
  plan?: string | null;
}

export interface CreateConsultationOutput {
  consultation: Consultation;
}

export class CreateConsultationUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  async execute(
    input: CreateConsultationInput
  ): Promise<CreateConsultationOutput> {
    const consultationData: DomainCreateConsultationInput = {
      organizationId: input.organizationId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      dateTime: input.dateTime,
      type: input.type,
      mainComplaint: input.mainComplaint ?? null,
      nutritionHistory: input.nutritionHistory ?? null,
      clinicalHistory: input.clinicalHistory ?? null,
      objectiveData: input.objectiveData ?? null,
      nutritionDiagnosis: input.nutritionDiagnosis ?? null,
      plan: input.plan ?? null,
    };

    const consultation = await this.consultationRepository.create(
      consultationData
    );

    return { consultation };
  }
}

