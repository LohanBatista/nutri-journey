import type {
  AiNutritionDiagnosisSuggestion,
  CreateAiNutritionDiagnosisSuggestionInput,
  AiNutritionDiagnosisSuggestionListFilters,
} from "../entities/AiNutritionDiagnosisSuggestion";

export interface AiNutritionDiagnosisSuggestionRepository {
  findById(
    id: string,
    organizationId: string
  ): Promise<AiNutritionDiagnosisSuggestion | null>;
  listByOrganization(
    filters: AiNutritionDiagnosisSuggestionListFilters
  ): Promise<AiNutritionDiagnosisSuggestion[]>;
  create(
    data: CreateAiNutritionDiagnosisSuggestionInput
  ): Promise<AiNutritionDiagnosisSuggestion>;
  delete(id: string): Promise<void>;
}

