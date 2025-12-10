import { GenerateNutritionDiagnosisSuggestionsUseCase } from "../use-cases/GenerateNutritionDiagnosisSuggestions";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";
import { PrismaAnthropometryRepository } from "@/infra/repositories/PrismaAnthropometryRepository";
import { PrismaLabResultRepository } from "@/infra/repositories/PrismaLabResultRepository";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";
import { OpenAiNutritionService } from "@/infra/ai/OpenAiNutritionService";
import { PrismaAiNutritionDiagnosisSuggestionRepository } from "@/infra/repositories/PrismaAiNutritionDiagnosisSuggestionRepository";

export function makeGenerateNutritionDiagnosisSuggestionsUseCase(): GenerateNutritionDiagnosisSuggestionsUseCase {
  const patientRepository = new PrismaPatientRepository();
  const anthropometryRepository = new PrismaAnthropometryRepository();
  const labResultRepository = new PrismaLabResultRepository();
  const consultationRepository = new PrismaConsultationRepository();
  const aiNutritionService = new OpenAiNutritionService();
  const aiNutritionDiagnosisSuggestionRepository = new PrismaAiNutritionDiagnosisSuggestionRepository();

  return new GenerateNutritionDiagnosisSuggestionsUseCase(
    patientRepository,
    anthropometryRepository,
    labResultRepository,
    consultationRepository,
    aiNutritionService,
    aiNutritionDiagnosisSuggestionRepository
  );
}

