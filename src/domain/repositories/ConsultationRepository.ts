import type {
  Consultation,
  ConsultationCreateInput,
  ConsultationUpdateInput,
} from "../entities/Consultation";

export interface ConsultationRepository {
  findById(id: string): Promise<Consultation | null>;
  findByPatientId(patientId: string): Promise<Consultation[]>;
  findByProfessionalId(professionalId: string): Promise<Consultation[]>;
  create(data: ConsultationCreateInput): Promise<Consultation>;
  update(id: string, data: ConsultationUpdateInput): Promise<Consultation>;
  delete(id: string): Promise<void>;
}
