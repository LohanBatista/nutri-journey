import { GetCurrentProfessionalProfileUseCase } from "../use-cases/GetCurrentProfessionalProfile";
import { PrismaProfessionalRepository } from "@/infra/repositories/PrismaProfessionalRepository";

export function makeGetCurrentProfessionalProfileUseCase(): GetCurrentProfessionalProfileUseCase {
  const professionalRepository = new PrismaProfessionalRepository();
  return new GetCurrentProfessionalProfileUseCase(professionalRepository);
}

