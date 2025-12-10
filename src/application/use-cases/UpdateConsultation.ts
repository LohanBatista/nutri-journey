import type {
  Consultation,
  UpdateConsultationInput as DomainUpdateConsultationInput,
} from "@/domain/entities/Consultation";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export interface UpdateConsultationInput {
  id: string;
  organizationId: string;
  dateTime?: Date;
  type?: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
  mainComplaint?: string | null;
  nutritionHistory?: string | null;
  clinicalHistory?: string | null;
  objectiveData?: string | null;
  nutritionDiagnosis?: string | null;
  plan?: string | null;
}

export interface UpdateConsultationOutput {
  consultation: Consultation;
}

export class UpdateConsultationUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  async execute(
    input: UpdateConsultationInput
  ): Promise<UpdateConsultationOutput> {
    const existingConsultation = await this.consultationRepository.findById(
      input.id,
      input.organizationId
    );

    if (!existingConsultation) {
      throw new Error("Consultation not found");
    }

    const updateData: DomainUpdateConsultationInput = {};
    if (input.dateTime !== undefined) updateData.dateTime = input.dateTime;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.mainComplaint !== undefined)
      updateData.mainComplaint = input.mainComplaint;
    if (input.nutritionHistory !== undefined)
      updateData.nutritionHistory = input.nutritionHistory;
    if (input.clinicalHistory !== undefined)
      updateData.clinicalHistory = input.clinicalHistory;
    if (input.objectiveData !== undefined)
      updateData.objectiveData = input.objectiveData;
    if (input.nutritionDiagnosis !== undefined)
      updateData.nutritionDiagnosis = input.nutritionDiagnosis;
    if (input.plan !== undefined) updateData.plan = input.plan;

    const consultation = await this.consultationRepository.update(
      input.id,
      updateData
    );

    return { consultation };
  }
}

