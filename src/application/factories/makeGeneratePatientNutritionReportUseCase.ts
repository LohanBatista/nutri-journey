import { GeneratePatientNutritionReportUseCase } from "../use-cases/GeneratePatientNutritionReport";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";
import { PrismaAnthropometryRepository } from "@/infra/repositories/PrismaAnthropometryRepository";
import { PrismaLabResultRepository } from "@/infra/repositories/PrismaLabResultRepository";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";
import { PrismaNutritionPlanRepository } from "@/infra/repositories/PrismaNutritionPlanRepository";
import { PrismaNutritionGeneralGuidanceRepository } from "@/infra/repositories/PrismaNutritionGeneralGuidanceRepository";

export function makeGeneratePatientNutritionReportUseCase(): GeneratePatientNutritionReportUseCase {
  const patientRepository = new PrismaPatientRepository();
  const anthropometryRepository = new PrismaAnthropometryRepository();
  const labResultRepository = new PrismaLabResultRepository();
  const consultationRepository = new PrismaConsultationRepository();
  const nutritionPlanRepository = new PrismaNutritionPlanRepository();
  const nutritionGeneralGuidanceRepository =
    new PrismaNutritionGeneralGuidanceRepository();

  return new GeneratePatientNutritionReportUseCase(
    patientRepository,
    anthropometryRepository,
    labResultRepository,
    consultationRepository,
    nutritionPlanRepository,
    nutritionGeneralGuidanceRepository
  );
}
