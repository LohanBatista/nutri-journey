import type {
  Professional,
  ProfessionalCreateInput,
  ProfessionalUpdateInput,
} from "../entities/Professional";

export interface ProfessionalRepository {
  findById(id: string): Promise<Professional | null>;
  findByEmail(email: string): Promise<Professional | null>;
  create(data: ProfessionalCreateInput): Promise<Professional>;
  update(id: string, data: ProfessionalUpdateInput): Promise<Professional>;
  delete(id: string): Promise<void>;
}
