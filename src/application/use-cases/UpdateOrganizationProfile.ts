import type {
  Organization,
  OrganizationUpdateInput as DomainOrganizationUpdateInput,
} from "@/domain/entities/Organization";
import type { OrganizationRepository } from "@/domain/repositories/OrganizationRepository";

export interface UpdateOrganizationProfileInput {
  organizationId: string;
  name?: string;
}

export interface UpdateOrganizationProfileOutput {
  organization: Organization;
}

export class UpdateOrganizationProfileUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository
  ) {}

  async execute(
    input: UpdateOrganizationProfileInput
  ): Promise<UpdateOrganizationProfileOutput> {
    const existingOrganization = await this.organizationRepository.findById(
      input.organizationId
    );

    if (!existingOrganization) {
      throw new Error("Organization not found");
    }

    const updateData: DomainOrganizationUpdateInput = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    const organization = await this.organizationRepository.update(
      input.organizationId,
      updateData
    );

    return {
      organization,
    };
  }
}

