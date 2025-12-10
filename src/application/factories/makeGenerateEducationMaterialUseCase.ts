import { GenerateEducationMaterialUseCase } from "../use-cases/GenerateEducationMaterial";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";
import { OpenAiNutritionService } from "@/infra/ai/OpenAiNutritionService";
import { PrismaAiEducationMaterialRepository } from "@/infra/repositories/PrismaAiEducationMaterialRepository";

export function makeGenerateEducationMaterialUseCase(): GenerateEducationMaterialUseCase {
  const patientRepository = new PrismaPatientRepository();
  const programRepository = new PrismaProgramRepository();
  const aiNutritionService = new OpenAiNutritionService();
  const aiEducationMaterialRepository = new PrismaAiEducationMaterialRepository();

  return new GenerateEducationMaterialUseCase(
    patientRepository,
    programRepository,
    aiNutritionService,
    aiEducationMaterialRepository
  );
}

