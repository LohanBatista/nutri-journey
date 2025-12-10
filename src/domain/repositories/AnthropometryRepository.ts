import type {
  AnthropometryRecord,
  CreateAnthropometryRecordInput,
  UpdateAnthropometryRecordInput,
  AnthropometryRecordListFilters,
} from "../entities/AnthropometryRecord";

export interface AnthropometryRepository {
  findById(
    id: string,
    organizationId: string
  ): Promise<AnthropometryRecord | null>;
  listByPatient(
    patientId: string,
    organizationId: string,
    filters?: AnthropometryRecordListFilters
  ): Promise<AnthropometryRecord[]>;
  create(data: CreateAnthropometryRecordInput): Promise<AnthropometryRecord>;
  update(
    id: string,
    data: UpdateAnthropometryRecordInput
  ): Promise<AnthropometryRecord>;
  delete(id: string): Promise<void>;
}
