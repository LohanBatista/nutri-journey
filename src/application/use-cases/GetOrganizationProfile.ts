import type { Organization } from "@/domain/entities/Organization";
import type { OrganizationRepository } from "@/domain/repositories/OrganizationRepository";

export interface GetOrganizationProfileInput {
  organizationId: string;
}

export interface GetOrganizationProfileOutput {
  organization: Organization;
}

export class GetOrganizationProfileUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(
    input: GetOrganizationProfileInput
  ): Promise<GetOrganizationProfileOutput> {
    const organization = await this.organizationRepository.findById(
      input.organizationId
    );

    if (!organization) {
      throw new Error("Organization not found");
    }

    return {
      organization,
    };
  }
}

