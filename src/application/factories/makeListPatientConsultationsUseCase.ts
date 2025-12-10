import { ListPatientConsultationsUseCase } from "../use-cases/ListPatientConsultations";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";

export function makeListPatientConsultationsUseCase(): ListPatientConsultationsUseCase {
  const consultationRepository = new PrismaConsultationRepository();
  return new ListPatientConsultationsUseCase(consultationRepository);
}

