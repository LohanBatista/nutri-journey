import { GenerateProgramSummaryUseCase } from "../use-cases/GenerateProgramSummary";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";
import { OpenAiNutritionService } from "@/infra/ai/OpenAiNutritionService";
import { PrismaAiProgramSummaryRepository } from "@/infra/repositories/PrismaAiProgramSummaryRepository";

export function makeGenerateProgramSummaryUseCase(): GenerateProgramSummaryUseCase {
  const programRepository = new PrismaProgramRepository();
  const aiNutritionService = new OpenAiNutritionService();
  const aiProgramSummaryRepository = new PrismaAiProgramSummaryRepository();

  return new GenerateProgramSummaryUseCase(
    programRepository,
    aiNutritionService,
    aiProgramSummaryRepository
  );
}

