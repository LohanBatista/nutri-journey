import { UpdateProfessionalProfileUseCase } from "../use-cases/UpdateProfessionalProfile";
import { PrismaProfessionalRepository } from "@/infra/repositories/PrismaProfessionalRepository";
import { BcryptPasswordHasher } from "@/infra/cryptography/password-hasher";

export function makeUpdateProfessionalProfileUseCase(): UpdateProfessionalProfileUseCase {
  const professionalRepository = new PrismaProfessionalRepository();
  const passwordHasher = new BcryptPasswordHasher();
  return new UpdateProfessionalProfileUseCase(professionalRepository, passwordHasher);
}

