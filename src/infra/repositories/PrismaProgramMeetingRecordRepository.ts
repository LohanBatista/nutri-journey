import type {
  ProgramMeetingRecord,
  RecordProgramMeetingInput,
} from "@/domain/entities/Program";
import type { ProgramMeetingRecordRepository } from "@/domain/repositories/ProgramMeetingRecordRepository";
import { prisma } from "../database/prisma";

export class PrismaProgramMeetingRecordRepository
  implements ProgramMeetingRecordRepository
{
  async findByMeetingId(meetingId: string): Promise<ProgramMeetingRecord[]> {
    const records = await prisma.programMeetingRecord.findMany({
      where: { programMeetingId: meetingId },
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => this.toDomain(r));
  }

  async findByMeetingAndPatient(
    meetingId: string,
    patientId: string
  ): Promise<ProgramMeetingRecord | null> {
    const record = await prisma.programMeetingRecord.findUnique({
      where: {
        programMeetingId_patientId: {
          programMeetingId: meetingId,
          patientId,
        },
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async createOrUpdate(
    data: RecordProgramMeetingInput
  ): Promise<ProgramMeetingRecord> {
    const record = await prisma.programMeetingRecord.upsert({
      where: {
        programMeetingId_patientId: {
          programMeetingId: data.programMeetingId,
          patientId: data.patientId,
        },
      },
      create: {
        programMeetingId: data.programMeetingId,
        patientId: data.patientId,
        presence: data.presence,
        weightKg: data.weightKg ?? null,
        bmi: data.bmi ?? null,
        bloodPressureSystolic: data.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: data.bloodPressureDiastolic ?? null,
        notes: data.notes ?? null,
      },
      update: {
        presence: data.presence,
        weightKg: data.weightKg ?? null,
        bmi: data.bmi ?? null,
        bloodPressureSystolic: data.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: data.bloodPressureDiastolic ?? null,
        notes: data.notes ?? null,
      },
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.programMeetingRecord.delete({
      where: { id },
    });
  }

  private toDomain(record: any): ProgramMeetingRecord {
    return {
      id: record.id,
      programMeetingId: record.programMeetingId,
      patientId: record.patientId,
      presence: record.presence,
      weightKg: record.weightKg,
      bmi: record.bmi,
      bloodPressureSystolic: record.bloodPressureSystolic,
      bloodPressureDiastolic: record.bloodPressureDiastolic,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

