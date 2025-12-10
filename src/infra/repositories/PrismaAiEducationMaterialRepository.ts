import type {
  AiEducationMaterial,
  CreateAiEducationMaterialInput,
  AiEducationMaterialListFilters,
} from "@/domain/entities/AiEducationMaterial";
import type { AiEducationMaterialRepository } from "@/domain/repositories/AiEducationMaterialRepository";
import { prisma } from "../database/prisma";

export class PrismaAiEducationMaterialRepository
  implements AiEducationMaterialRepository
{
  async findById(
    id: string,
    organizationId: string
  ): Promise<AiEducationMaterial | null> {
    const material = await prisma.aiEducationMaterial.findFirst({
      where: { id, organizationId },
    });

    if (!material) {
      return null;
    }

    return this.toDomain(material);
  }

  async listByOrganization(
    filters: AiEducationMaterialListFilters
  ): Promise<AiEducationMaterial[]> {
    const where: {
      organizationId: string;
      patientId?: string | null;
      programId?: string | null;
    } = {
      organizationId: filters.organizationId,
    };

    if (filters.patientId !== undefined) {
      where.patientId = filters.patientId;
    }

    if (filters.programId !== undefined) {
      where.programId = filters.programId;
    }

    const materials = await prisma.aiEducationMaterial.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return materials.map((m) => this.toDomain(m));
  }

  async create(
    data: CreateAiEducationMaterialInput
  ): Promise<AiEducationMaterial> {
    const material = await prisma.aiEducationMaterial.create({
      data: {
        organizationId: data.organizationId,
        patientId: data.patientId ?? null,
        programId: data.programId ?? null,
        topic: data.topic,
        context: data.context,
        text: data.text,
      },
    });

    return this.toDomain(material);
  }

  async delete(id: string): Promise<void> {
    await prisma.aiEducationMaterial.delete({
      where: { id },
    });
  }

  private toDomain(material: {
    id: string;
    organizationId: string;
    patientId: string | null;
    programId: string | null;
    topic: string;
    context: string;
    text: string;
    createdAt: Date;
  }): AiEducationMaterial {
    return {
      id: material.id,
      organizationId: material.organizationId,
      patientId: material.patientId,
      programId: material.programId,
      topic: material.topic,
      context: material.context as "INDIVIDUAL" | "GROUP",
      text: material.text,
      createdAt: material.createdAt,
    };
  }
}

