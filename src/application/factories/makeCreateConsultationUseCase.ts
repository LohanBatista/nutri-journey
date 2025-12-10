import { CreateConsultationUseCase } from "../use-cases/CreateConsultation";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";

export function makeCreateConsultationUseCase(): CreateConsultationUseCase {
  const consultationRepository = new PrismaConsultationRepository();
  return new CreateConsultationUseCase(consultationRepository);
}

