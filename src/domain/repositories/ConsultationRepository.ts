import type {
  Consultation,
  CreateConsultationInput,
  UpdateConsultationInput,
  ConsultationListFilters,
} from "../entities/Consultation";

export interface ConsultationRepository {
  findById(id: string, organizationId: string): Promise<Consultation | null>;
  listByOrganization(
    organizationId: string,
    filters?: ConsultationListFilters
  ): Promise<Consultation[]>;
  create(data: CreateConsultationInput): Promise<Consultation>;
  update(id: string, data: UpdateConsultationInput): Promise<Consultation>;
  delete(id: string): Promise<void>;
}
