import type {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
} from "../entities/Patient";

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByOrganizationId(organizationId: string): Promise<Patient[]>;
  create(data: PatientCreateInput): Promise<Patient>;
  update(id: string, data: PatientUpdateInput): Promise<Patient>;
  delete(id: string): Promise<void>;
}
