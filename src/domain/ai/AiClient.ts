import type {
  GeneratePatientSummaryInput,
  GeneratePatientSummaryOutput,
  AiSummaryType,
} from "./types";

export interface AiClient {
  generatePatientSummary(
    input: GeneratePatientSummaryInput,
    type: AiSummaryType
  ): Promise<GeneratePatientSummaryOutput>;
}

