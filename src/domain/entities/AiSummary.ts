import type { AiSummaryType } from "../ai/types";

export interface AiSummary {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  type: AiSummaryType;
  periodStart: Date | null;
  periodEnd: Date | null;
  textForProfessional: string;
  createdAt: Date;
}

export interface CreateAiSummaryInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  type: AiSummaryType;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  textForProfessional: string;
}

export interface AiSummaryListFilters {
  patientId: string;
  organizationId: string;
  type?: AiSummaryType;
  startDate?: Date;
  endDate?: Date;
}

