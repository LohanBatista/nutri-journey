import type {
  AnthropometryRecord,
  CreateAnthropometryRecordInput,
  UpdateAnthropometryRecordInput,
  AnthropometryRecordListFilters,
} from "@/domain/entities/AnthropometryRecord";
import type { AnthropometryRepository } from "@/domain/repositories/AnthropometryRepository";
import { prisma } from "../database/prisma";

export class PrismaAnthropometryRepository implements AnthropometryRepository {
  async findById(
    id: string,
    organizationId: string
  ): Promise<AnthropometryRecord | null> {
    const record = await prisma.anthropometryRecord.findFirst({
      where: { id, organizationId },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async listByPatient(
    patientId: string,
    organizationId: string,
    filters?: AnthropometryRecordListFilters
  ): Promise<AnthropometryRecord[]> {
    const where: {
      patientId: string;
      organizationId: string;
      date?: { gte?: Date; lte?: Date };
    } = {
      patientId,
      organizationId,
    };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const records = await prisma.anthropometryRecord.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return records.map((record) => this.toDomain(record));
  }

  async create(
    data: CreateAnthropometryRecordInput
  ): Promise<AnthropometryRecord> {
    const record = await prisma.anthropometryRecord.create({
      data: {
        organizationId: data.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        date: data.date,
        weightKg: data.weightKg,
        heightM: data.heightM,
        bmi: data.bmi,
        waistCircumference: data.waistCircumference,
        hipCircumference: data.hipCircumference,
        armCircumference: data.armCircumference,
        notes: data.notes,
      },
    });

    return this.toDomain(record);
  }

  async update(
    id: string,
    data: UpdateAnthropometryRecordInput
  ): Promise<AnthropometryRecord> {
    const record = await prisma.anthropometryRecord.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: data.date }),
        ...(data.weightKg !== undefined && { weightKg: data.weightKg }),
        ...(data.heightM !== undefined && { heightM: data.heightM }),
        ...(data.bmi !== undefined && { bmi: data.bmi }),
        ...(data.waistCircumference !== undefined && {
          waistCircumference: data.waistCircumference,
        }),
        ...(data.hipCircumference !== undefined && {
          hipCircumference: data.hipCircumference,
        }),
        ...(data.armCircumference !== undefined && {
          armCircumference: data.armCircumference,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.anthropometryRecord.delete({
      where: { id },
    });
  }

  private toDomain(record: {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    date: Date;
    weightKg: number | null;
    heightM: number | null;
    bmi: number | null;
    waistCircumference: number | null;
    hipCircumference: number | null;
    armCircumference: number | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AnthropometryRecord {
    return {
      id: record.id,
      organizationId: record.organizationId,
      patientId: record.patientId,
      professionalId: record.professionalId,
      date: record.date,
      weightKg: record.weightKg,
      heightM: record.heightM,
      bmi: record.bmi,
      waistCircumference: record.waistCircumference,
      hipCircumference: record.hipCircumference,
      armCircumference: record.armCircumference,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

