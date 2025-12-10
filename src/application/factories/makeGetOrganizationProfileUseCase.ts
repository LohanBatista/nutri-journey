import { GetOrganizationProfileUseCase } from "../use-cases/GetOrganizationProfile";
import { PrismaOrganizationRepository } from "@/infra/repositories/PrismaOrganizationRepository";

export function makeGetOrganizationProfileUseCase(): GetOrganizationProfileUseCase {
  const organizationRepository = new PrismaOrganizationRepository();
  return new GetOrganizationProfileUseCase(organizationRepository);
}

