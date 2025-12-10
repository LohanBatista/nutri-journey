import { AuthenticateProfessionalUseCase } from "../use-cases/AuthenticateProfessional";
import { PrismaProfessionalRepository } from "@/infra/repositories/PrismaProfessionalRepository";
import { PrismaOrganizationRepository } from "@/infra/repositories/PrismaOrganizationRepository";
import { BcryptPasswordHasher } from "@/infra/cryptography/password-hasher";

export function makeAuthenticateProfessionalUseCase(): AuthenticateProfessionalUseCase {
  const professionalRepository = new PrismaProfessionalRepository();
  const organizationRepository = new PrismaOrganizationRepository();
  const passwordHasher = new BcryptPasswordHasher();
  
  return new AuthenticateProfessionalUseCase(
    professionalRepository,
    organizationRepository,
    passwordHasher
  );
}

