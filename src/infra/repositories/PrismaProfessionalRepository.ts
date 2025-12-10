import type {
  Professional,
  ProfessionalCreateInput,
  ProfessionalUpdateInput,
} from "@/domain/entities/Professional";
import type { ProfessionalRepository } from "@/domain/repositories/ProfessionalRepository";
import { prisma } from "../database/prisma";

export class PrismaProfessionalRepository implements ProfessionalRepository {
  async findById(id: string): Promise<Professional | null> {
    const professional = await prisma.professional.findUnique({
      where: { id },
    });

    if (!professional) {
      return null;
    }

    return this.toDomain(professional);
  }

  async findByEmail(email: string): Promise<Professional | null> {
    const professional = await prisma.professional.findUnique({
      where: { email },
    });

    if (!professional) {
      return null;
    }

    return this.toDomain(professional);
  }

  async create(data: ProfessionalCreateInput): Promise<Professional> {
    const professional = await prisma.professional.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        organizationId: data.organizationId,
      },
    });

    return this.toDomain(professional);
  }

  async update(id: string, data: ProfessionalUpdateInput): Promise<Professional> {
    const professional = await prisma.professional.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
      },
    });

    return this.toDomain(professional);
  }

  async delete(id: string): Promise<void> {
    await prisma.professional.delete({
      where: { id },
    });
  }

  private toDomain(professional: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Professional {
    return {
      id: professional.id,
      name: professional.name,
      email: professional.email,
      passwordHash: professional.passwordHash,
      organizationId: professional.organizationId,
      createdAt: professional.createdAt,
      updatedAt: professional.updatedAt,
    };
  }
}

