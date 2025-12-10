import type {
  AiSummary,
  CreateAiSummaryInput,
  AiSummaryListFilters,
} from "@/domain/entities/AiSummary";
import type { AiSummaryRepository } from "@/domain/repositories/AiSummaryRepository";
import { prisma } from "../database/prisma";

export class PrismaAiSummaryRepository implements AiSummaryRepository {
  async findById(id: string, organizationId: string): Promise<AiSummary | null> {
    const summary = await prisma.aiSummary.findFirst({
      where: { id, organizationId },
    });

    if (!summary) {
      return null;
    }

    return this.toDomain(summary);
  }

  async listByPatient(
    filters: AiSummaryListFilters
  ): Promise<AiSummary[]> {
    const where: {
      patientId: string;
      organizationId: string;
      type?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      patientId: filters.patientId,
      organizationId: filters.organizationId,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const summaries = await prisma.aiSummary.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return summaries.map((summary) => this.toDomain(summary));
  }

  async create(data: CreateAiSummaryInput): Promise<AiSummary> {
    const summary = await prisma.aiSummary.create({
      data: {
        organizationId: data.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        type: data.type,
        periodStart: data.periodStart ?? null,
        periodEnd: data.periodEnd ?? null,
        textForProfessional: data.textForProfessional,
      },
    });

    return this.toDomain(summary);
  }

  async delete(id: string): Promise<void> {
    await prisma.aiSummary.delete({
      where: { id },
    });
  }

  private toDomain(summary: {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    type: string;
    periodStart: Date | null;
    periodEnd: Date | null;
    textForProfessional: string;
    createdAt: Date;
  }): AiSummary {
    return {
      id: summary.id,
      organizationId: summary.organizationId,
      patientId: summary.patientId,
      professionalId: summary.professionalId,
      type: summary.type as "WEEKLY_OVERVIEW" | "FULL_HISTORY" | "PRE_CONSULT",
      periodStart: summary.periodStart,
      periodEnd: summary.periodEnd,
      textForProfessional: summary.textForProfessional,
      createdAt: summary.createdAt,
    };
  }
}

