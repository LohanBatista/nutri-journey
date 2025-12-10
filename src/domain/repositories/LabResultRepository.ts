import type {
  LabResult,
  CreateLabResultInput,
  UpdateLabResultInput,
  LabResultListFilters,
} from "../entities/LabResult";

export interface LabResultRepository {
  findById(id: string, organizationId: string): Promise<LabResult | null>;
  listByPatient(
    patientId: string,
    organizationId: string,
    filters?: LabResultListFilters
  ): Promise<LabResult[]>;
  create(data: CreateLabResultInput): Promise<LabResult>;
  update(id: string, data: UpdateLabResultInput): Promise<LabResult>;
  delete(id: string): Promise<void>;
}
