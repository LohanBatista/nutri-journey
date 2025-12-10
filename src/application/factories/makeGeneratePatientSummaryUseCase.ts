import { GeneratePatientSummaryUseCase } from "../use-cases/GeneratePatientSummary";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";
import { PrismaAnthropometryRepository } from "@/infra/repositories/PrismaAnthropometryRepository";
import { PrismaLabResultRepository } from "@/infra/repositories/PrismaLabResultRepository";
import { PrismaNutritionPlanRepository } from "@/infra/repositories/PrismaNutritionPlanRepository";
import { OpenAiClient } from "@/infra/ai/OpenAiClient";
import { PrismaAiSummaryRepository } from "@/infra/repositories/PrismaAiSummaryRepository";
import { getEnv } from "@/config/env";

export function makeGeneratePatientSummaryUseCase(): GeneratePatientSummaryUseCase {
  const patientRepository = new PrismaPatientRepository();
  const consultationRepository = new PrismaConsultationRepository();
  const anthropometryRepository = new PrismaAnthropometryRepository();
  const labResultRepository = new PrismaLabResultRepository();
  const nutritionPlanRepository = new PrismaNutritionPlanRepository();
  const aiClient = new OpenAiClient(getEnv().OPENAI_API_KEY);
  const aiSummaryRepository = new PrismaAiSummaryRepository();

  return new GeneratePatientSummaryUseCase(
    patientRepository,
    consultationRepository,
    anthropometryRepository,
    labResultRepository,
    nutritionPlanRepository,
    aiClient,
    aiSummaryRepository
  );
}

