import { GetOrganizationAnalyticsUseCase } from "../use-cases/GetOrganizationAnalytics";
import { PrismaPatientRepository } from "@/infra/repositories/PrismaPatientRepository";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";

export function makeGetOrganizationAnalyticsUseCase(): GetOrganizationAnalyticsUseCase {
  const patientRepository = new PrismaPatientRepository();
  const consultationRepository = new PrismaConsultationRepository();
  const programRepository = new PrismaProgramRepository();
  return new GetOrganizationAnalyticsUseCase(
    patientRepository,
    consultationRepository,
    programRepository
  );
}

