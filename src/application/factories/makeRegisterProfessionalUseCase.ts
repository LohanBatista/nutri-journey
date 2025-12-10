import { RegisterProfessionalUseCase } from "../use-cases/RegisterProfessional";
import { PrismaProfessionalRepository } from "@/infra/repositories/PrismaProfessionalRepository";
import { PrismaOrganizationRepository } from "@/infra/repositories/PrismaOrganizationRepository";
import { BcryptPasswordHasher } from "@/infra/cryptography/password-hasher";

export function makeRegisterProfessionalUseCase(): RegisterProfessionalUseCase {
  const professionalRepository = new PrismaProfessionalRepository();
  const organizationRepository = new PrismaOrganizationRepository();
  const passwordHasher = new BcryptPasswordHasher();
  
  return new RegisterProfessionalUseCase(
    professionalRepository,
    organizationRepository,
    passwordHasher
  );
}

