export type AiProgramSummaryType = "MEETING_SUMMARY" | "PROGRAM_OVERVIEW";

export interface AiProgramSummary {
  id: string;
  organizationId: string;
  programId: string;
  type: AiProgramSummaryType;
  meetingId: string | null;
  text: string;
  createdAt: Date;
}

export interface CreateAiProgramSummaryInput {
  organizationId: string;
  programId: string;
  type: AiProgramSummaryType;
  meetingId?: string | null;
  text: string;
}

export interface AiProgramSummaryListFilters {
  programId: string;
  organizationId: string;
  type?: AiProgramSummaryType;
  meetingId?: string | null;
}

