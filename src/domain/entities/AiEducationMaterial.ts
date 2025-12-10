export interface AiEducationMaterial {
  id: string;
  organizationId: string;
  patientId: string | null;
  programId: string | null;
  topic: string;
  context: "INDIVIDUAL" | "GROUP";
  text: string;
  createdAt: Date;
}

export interface CreateAiEducationMaterialInput {
  organizationId: string;
  patientId?: string | null;
  programId?: string | null;
  topic: string;
  context: "INDIVIDUAL" | "GROUP";
  text: string;
}

export interface AiEducationMaterialListFilters {
  organizationId: string;
  patientId?: string | null;
  programId?: string | null;
}

