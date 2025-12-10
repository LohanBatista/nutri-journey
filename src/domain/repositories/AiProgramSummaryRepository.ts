import type {
  AiProgramSummary,
  CreateAiProgramSummaryInput,
  AiProgramSummaryListFilters,
} from "../entities/AiProgramSummary";

export interface AiProgramSummaryRepository {
  findById(
    id: string,
    organizationId: string
  ): Promise<AiProgramSummary | null>;
  listByOrganization(
    filters: AiProgramSummaryListFilters
  ): Promise<AiProgramSummary[]>;
  create(data: CreateAiProgramSummaryInput): Promise<AiProgramSummary>;
  delete(id: string): Promise<void>;
}

