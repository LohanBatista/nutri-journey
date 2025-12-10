import { UpdateConsultationUseCase } from "../use-cases/UpdateConsultation";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";

export function makeUpdateConsultationUseCase(): UpdateConsultationUseCase {
  const consultationRepository = new PrismaConsultationRepository();
  return new UpdateConsultationUseCase(consultationRepository);
}

