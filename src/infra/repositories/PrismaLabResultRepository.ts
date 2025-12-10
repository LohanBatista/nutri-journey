import type {
  LabResult,
  CreateLabResultInput,
  UpdateLabResultInput,
  LabResultListFilters,
} from "@/domain/entities/LabResult";
import type { LabResultRepository } from "@/domain/repositories/LabResultRepository";
import { prisma } from "../database/prisma";

export class PrismaLabResultRepository implements LabResultRepository {
  async findById(id: string, organizationId: string): Promise<LabResult | null> {
    const result = await prisma.labResult.findFirst({
      where: { id, organizationId },
    });

    if (!result) {
      return null;
    }

    return this.toDomain(result);
  }

  async listByPatient(
    patientId: string,
    organizationId: string,
    filters?: LabResultListFilters
  ): Promise<LabResult[]> {
    const where: {
      patientId: string;
      organizationId: string;
      testType?: string;
      date?: { gte?: Date; lte?: Date };
    } = {
      patientId,
      organizationId,
    };

    if (filters?.testType) {
      where.testType = filters.testType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const results = await prisma.labResult.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return results.map((result) => this.toDomain(result));
  }

  async create(data: CreateLabResultInput): Promise<LabResult> {
    const result = await prisma.labResult.create({
      data: {
        organizationId: data.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        date: data.date,
        testType: data.testType,
        name: data.name,
        value: String(data.value),
        unit: data.unit,
        referenceRange: data.referenceRange,
        notes: data.notes,
      },
    });

    return this.toDomain(result);
  }

  async update(id: string, data: UpdateLabResultInput): Promise<LabResult> {
    const result = await prisma.labResult.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: data.date }),
        ...(data.testType !== undefined && { testType: data.testType }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.value !== undefined && { value: String(data.value) }),
        ...(data.unit !== undefined && { unit: data.unit }),
        ...(data.referenceRange !== undefined && {
          referenceRange: data.referenceRange,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return this.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await prisma.labResult.delete({
      where: { id },
    });
  }

  private toDomain(result: {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    date: Date;
    testType: string;
    name: string;
    value: string;
    unit: string;
    referenceRange: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): LabResult {
    // Tenta converter para número se possível, senão mantém como string
    const numericValue = Number(result.value);
    const parsedValue: number | string =
      !isNaN(numericValue) && isFinite(numericValue)
        ? numericValue
        : result.value;

    return {
      id: result.id,
      organizationId: result.organizationId,
      patientId: result.patientId,
      professionalId: result.professionalId,
      date: result.date,
      testType: result.testType as
        | "GLYCEMIA"
        | "HBA1C"
        | "CT"
        | "HDL"
        | "LDL"
        | "TG"
        | "OTHER",
      name: result.name,
      value: parsedValue,
      unit: result.unit,
      referenceRange: result.referenceRange,
      notes: result.notes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}

