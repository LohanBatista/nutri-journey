import type {
  Patient,
  CreatePatientInput,
  UpdatePatientInput,
  PatientListFilters,
} from "../entities/Patient";

export interface PatientRepository {
  findById(id: string, organizationId: string): Promise<Patient | null>;
  listByOrganization(
    organizationId: string,
    filters?: PatientListFilters
  ): Promise<Patient[]>;
  create(data: CreatePatientInput): Promise<Patient>;
  update(id: string, data: UpdatePatientInput): Promise<Patient>;
  delete(id: string): Promise<void>;
}
