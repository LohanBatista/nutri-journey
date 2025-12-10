export interface AiNutritionDiagnosisSuggestion {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  consultationId: string | null;
  diagnoses: Array<{
    title: string;
    pesFormat: string | null;
    rationale: string;
  }>;
  createdAt: Date;
}

export interface CreateAiNutritionDiagnosisSuggestionInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  consultationId?: string | null;
  diagnoses: Array<{
    title: string;
    pesFormat: string | null;
    rationale: string;
  }>;
}

export interface AiNutritionDiagnosisSuggestionListFilters {
  patientId: string;
  organizationId: string;
  consultationId?: string | null;
}

