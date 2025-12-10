import type {
  NutritionGeneralGuidance,
  CreateNutritionGeneralGuidanceInput,
  UpdateNutritionGeneralGuidanceInput,
} from "@/domain/entities/NutritionGeneralGuidance";
import type { NutritionGeneralGuidanceRepository } from "@/domain/repositories/NutritionGeneralGuidanceRepository";
import { prisma } from "../database/prisma";

export class PrismaNutritionGeneralGuidanceRepository
  implements NutritionGeneralGuidanceRepository
{
  async findById(
    id: string,
    organizationId: string
  ): Promise<NutritionGeneralGuidance | null> {
    const guidance = await prisma.nutritionGeneralGuidance.findFirst({
      where: { id, organizationId },
    });

    if (!guidance) {
      return null;
    }

    return this.toDomain(guidance);
  }

  async findLatestByPatient(
    patientId: string,
    organizationId: string
  ): Promise<NutritionGeneralGuidance | null> {
    const guidance = await prisma.nutritionGeneralGuidance.findFirst({
      where: {
        patientId,
        organizationId,
      },
      orderBy: { date: "desc" },
    });

    if (!guidance) {
      return null;
    }

    return this.toDomain(guidance);
  }

  async listByPatient(
    patientId: string,
    organizationId: string
  ): Promise<NutritionGeneralGuidance[]> {
    const guidances = await prisma.nutritionGeneralGuidance.findMany({
      where: {
        patientId,
        organizationId,
      },
      orderBy: { date: "desc" },
    });

    return guidances.map((guidance) => this.toDomain(guidance));
  }

  async create(
    data: CreateNutritionGeneralGuidanceInput
  ): Promise<NutritionGeneralGuidance> {
    const guidance = await prisma.nutritionGeneralGuidance.create({
      data: {
        organizationId: data.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        date: data.date,
        hydrationGuidance: data.hydrationGuidance ?? null,
        physicalActivityGuidance: data.physicalActivityGuidance ?? null,
        sleepGuidance: data.sleepGuidance ?? null,
        symptomManagementGuidance: data.symptomManagementGuidance ?? null,
        notes: data.notes ?? null,
      },
    });

    return this.toDomain(guidance);
  }

  async update(
    id: string,
    data: UpdateNutritionGeneralGuidanceInput
  ): Promise<NutritionGeneralGuidance> {
    const guidance = await prisma.nutritionGeneralGuidance.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: data.date }),
        ...(data.hydrationGuidance !== undefined && {
          hydrationGuidance: data.hydrationGuidance,
        }),
        ...(data.physicalActivityGuidance !== undefined && {
          physicalActivityGuidance: data.physicalActivityGuidance,
        }),
        ...(data.sleepGuidance !== undefined && {
          sleepGuidance: data.sleepGuidance,
        }),
        ...(data.symptomManagementGuidance !== undefined && {
          symptomManagementGuidance: data.symptomManagementGuidance,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return this.toDomain(guidance);
  }

  async delete(id: string): Promise<void> {
    await prisma.nutritionGeneralGuidance.delete({
      where: { id },
    });
  }

  private toDomain(guidance: {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    date: Date;
    hydrationGuidance: string | null;
    physicalActivityGuidance: string | null;
    sleepGuidance: string | null;
    symptomManagementGuidance: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): NutritionGeneralGuidance {
    return {
      id: guidance.id,
      organizationId: guidance.organizationId,
      patientId: guidance.patientId,
      professionalId: guidance.professionalId,
      date: guidance.date,
      hydrationGuidance: guidance.hydrationGuidance,
      physicalActivityGuidance: guidance.physicalActivityGuidance,
      sleepGuidance: guidance.sleepGuidance,
      symptomManagementGuidance: guidance.symptomManagementGuidance,
      notes: guidance.notes,
      createdAt: guidance.createdAt,
      updatedAt: guidance.updatedAt,
    };
  }
}

