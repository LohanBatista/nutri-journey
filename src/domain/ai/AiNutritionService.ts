import type {
  GenerateNutritionDiagnosisInput,
  GenerateNutritionDiagnosisOutput,
  GenerateEducationMaterialInput,
  GenerateEducationMaterialOutput,
  GenerateProgramSummaryInput,
  GenerateProgramSummaryOutput,
} from "./types";

export interface AiNutritionService {
  generateNutritionDiagnosis(
    input: GenerateNutritionDiagnosisInput
  ): Promise<GenerateNutritionDiagnosisOutput>;
  generateEducationMaterial(
    input: GenerateEducationMaterialInput
  ): Promise<GenerateEducationMaterialOutput>;
  generateProgramSummary(
    input: GenerateProgramSummaryInput
  ): Promise<GenerateProgramSummaryOutput>;
}
