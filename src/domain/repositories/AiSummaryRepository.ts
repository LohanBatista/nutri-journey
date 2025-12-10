import type {
  AiSummary,
  CreateAiSummaryInput,
  AiSummaryListFilters,
} from "../entities/AiSummary";

export interface AiSummaryRepository {
  findById(id: string, organizationId: string): Promise<AiSummary | null>;
  listByPatient(
    filters: AiSummaryListFilters
  ): Promise<AiSummary[]>;
  create(data: CreateAiSummaryInput): Promise<AiSummary>;
  delete(id: string): Promise<void>;
}

