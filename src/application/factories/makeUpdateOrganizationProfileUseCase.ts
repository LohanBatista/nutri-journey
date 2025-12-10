import { UpdateOrganizationProfileUseCase } from "../use-cases/UpdateOrganizationProfile";
import { PrismaOrganizationRepository } from "@/infra/repositories/PrismaOrganizationRepository";

export function makeUpdateOrganizationProfileUseCase(): UpdateOrganizationProfileUseCase {
  const organizationRepository = new PrismaOrganizationRepository();
  return new UpdateOrganizationProfileUseCase(organizationRepository);
}

