import type {
  AiNutritionDiagnosisSuggestion,
  CreateAiNutritionDiagnosisSuggestionInput,
  AiNutritionDiagnosisSuggestionListFilters,
} from "@/domain/entities/AiNutritionDiagnosisSuggestion";
import type { AiNutritionDiagnosisSuggestionRepository } from "@/domain/repositories/AiNutritionDiagnosisSuggestionRepository";
import { prisma } from "../database/prisma";

export class PrismaAiNutritionDiagnosisSuggestionRepository
  implements AiNutritionDiagnosisSuggestionRepository
{
  async findById(
    id: string,
    organizationId: string
  ): Promise<AiNutritionDiagnosisSuggestion | null> {
    const suggestion = await prisma.aiNutritionDiagnosisSuggestion.findFirst({
      where: { id, organizationId },
    });

    if (!suggestion) {
      return null;
    }

    return this.toDomain(suggestion);
  }

  async listByOrganization(
    filters: AiNutritionDiagnosisSuggestionListFilters
  ): Promise<AiNutritionDiagnosisSuggestion[]> {
    const where: {
      organizationId: string;
      patientId: string;
      consultationId?: string | null;
    } = {
      organizationId: filters.organizationId,
      patientId: filters.patientId,
    };

    if (filters.consultationId !== undefined) {
      where.consultationId = filters.consultationId;
    }

    const suggestions = await prisma.aiNutritionDiagnosisSuggestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return suggestions.map((s) => this.toDomain(s));
  }

  async create(
    data: CreateAiNutritionDiagnosisSuggestionInput
  ): Promise<AiNutritionDiagnosisSuggestion> {
    const suggestion = await prisma.aiNutritionDiagnosisSuggestion.create({
      data: {
        organizationId: data.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        consultationId: data.consultationId ?? null,
        diagnoses: JSON.stringify(data.diagnoses),
      },
    });

    return this.toDomain(suggestion);
  }

  async delete(id: string): Promise<void> {
    await prisma.aiNutritionDiagnosisSuggestion.delete({
      where: { id },
    });
  }

  private toDomain(suggestion: {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    consultationId: string | null;
    diagnoses: string;
    createdAt: Date;
  }): AiNutritionDiagnosisSuggestion {
    return {
      id: suggestion.id,
      organizationId: suggestion.organizationId,
      patientId: suggestion.patientId,
      professionalId: suggestion.professionalId,
      consultationId: suggestion.consultationId,
      diagnoses: JSON.parse(suggestion.diagnoses) as Array<{
        title: string;
        pesFormat: string | null;
        rationale: string;
      }>,
      createdAt: suggestion.createdAt,
    };
  }
}
