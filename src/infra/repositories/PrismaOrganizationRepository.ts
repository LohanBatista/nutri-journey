import type {
  Organization,
  OrganizationCreateInput,
  OrganizationUpdateInput,
} from "@/domain/entities/Organization";
import type { OrganizationRepository } from "@/domain/repositories/OrganizationRepository";
import { prisma } from "../database/prisma";

export class PrismaOrganizationRepository implements OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return null;
    }

    return this.toDomain(organization);
  }

  async create(data: OrganizationCreateInput): Promise<Organization> {
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
      },
    });

    return this.toDomain(organization);
  }

  async update(
    id: string,
    data: OrganizationUpdateInput
  ): Promise<Organization> {
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
      },
    });

    return this.toDomain(organization);
  }

  async delete(id: string): Promise<void> {
    await prisma.organization.delete({
      where: { id },
    });
  }

  private toDomain(organization: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): Organization {
    return {
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }
}
