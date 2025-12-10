import type {
  AiProgramSummary,
  CreateAiProgramSummaryInput,
  AiProgramSummaryListFilters,
} from "@/domain/entities/AiProgramSummary";
import type { AiProgramSummaryRepository } from "@/domain/repositories/AiProgramSummaryRepository";
import { prisma } from "../database/prisma";

export class PrismaAiProgramSummaryRepository
  implements AiProgramSummaryRepository
{
  async findById(
    id: string,
    organizationId: string
  ): Promise<AiProgramSummary | null> {
    const summary = await prisma.aiProgramSummary.findFirst({
      where: { id, organizationId },
    });

    if (!summary) {
      return null;
    }

    return this.toDomain(summary);
  }

  async listByOrganization(
    filters: AiProgramSummaryListFilters
  ): Promise<AiProgramSummary[]> {
    const where: {
      organizationId: string;
      programId: string;
      type?: string;
      meetingId?: string | null;
    } = {
      organizationId: filters.organizationId,
      programId: filters.programId,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.meetingId !== undefined) {
      where.meetingId = filters.meetingId;
    }

    const summaries = await prisma.aiProgramSummary.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return summaries.map((s) => this.toDomain(s));
  }

  async create(data: CreateAiProgramSummaryInput): Promise<AiProgramSummary> {
    const summary = await prisma.aiProgramSummary.create({
      data: {
        organizationId: data.organizationId,
        programId: data.programId,
        type: data.type,
        meetingId: data.meetingId ?? null,
        text: data.text,
      },
    });

    return this.toDomain(summary);
  }

  async delete(id: string): Promise<void> {
    await prisma.aiProgramSummary.delete({
      where: { id },
    });
  }

  private toDomain(summary: {
    id: string;
    organizationId: string;
    programId: string;
    type: string;
    meetingId: string | null;
    text: string;
    createdAt: Date;
  }): AiProgramSummary {
    return {
      id: summary.id,
      organizationId: summary.organizationId,
      programId: summary.programId,
      type: summary.type as "MEETING_SUMMARY" | "PROGRAM_OVERVIEW",
      meetingId: summary.meetingId,
      text: summary.text,
      createdAt: summary.createdAt,
    };
  }
}
