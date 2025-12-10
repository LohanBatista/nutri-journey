import type { Consultation, ConsultationListFilters } from "@/domain/entities/Consultation";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export interface ListPatientConsultationsInput {
  organizationId: string;
  patientId: string;
  filters?: Omit<ConsultationListFilters, "patientId">;
}

export interface ListPatientConsultationsOutput {
  consultations: Consultation[];
}

export class ListPatientConsultationsUseCase {
  constructor(private readonly consultationRepository: ConsultationRepository) {}

  async execute(
    input: ListPatientConsultationsInput
  ): Promise<ListPatientConsultationsOutput> {
    const filters: ConsultationListFilters = {
      patientId: input.patientId,
      ...input.filters,
    };

    const consultations = await this.consultationRepository.listByOrganization(
      input.organizationId,
      filters
    );

    return { consultations };
  }
}

