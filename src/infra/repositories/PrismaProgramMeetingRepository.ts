import type {
  ProgramMeeting,
  CreateProgramMeetingInput,
} from "@/domain/entities/Program";
import type { ProgramMeetingRepository } from "@/domain/repositories/ProgramMeetingRepository";
import { prisma } from "../database/prisma";

export class PrismaProgramMeetingRepository
  implements ProgramMeetingRepository
{
  async findById(id: string): Promise<ProgramMeeting | null> {
    const meeting = await prisma.programMeeting.findUnique({
      where: { id },
      include: {
        records: true,
      },
    });

    if (!meeting) {
      return null;
    }

    return this.toDomain(meeting);
  }

  async findByProgramId(programId: string): Promise<ProgramMeeting[]> {
    const meetings = await prisma.programMeeting.findMany({
      where: { programId },
      include: {
        records: true,
      },
      orderBy: { date: "desc" },
    });

    return meetings.map((m) => this.toDomain(m));
  }

  async create(data: CreateProgramMeetingInput): Promise<ProgramMeeting> {
    const meeting = await prisma.programMeeting.create({
      data: {
        programId: data.programId,
        date: data.date,
        topic: data.topic,
        notes: data.notes ?? null,
      },
      include: {
        records: true,
      },
    });

    return this.toDomain(meeting);
  }

  async update(
    id: string,
    data: {
      date?: Date;
      topic?: string;
      notes?: string | null;
    }
  ): Promise<ProgramMeeting> {
    const meeting = await prisma.programMeeting.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: data.date }),
        ...(data.topic !== undefined && { topic: data.topic }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        records: true,
      },
    });

    return this.toDomain(meeting);
  }

  async delete(id: string): Promise<void> {
    await prisma.programMeeting.delete({
      where: { id },
    });
  }

  private toDomain(meeting: any): ProgramMeeting {
    return {
      id: meeting.id,
      programId: meeting.programId,
      date: meeting.date,
      topic: meeting.topic,
      notes: meeting.notes,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
      records: meeting.records?.map((r: any) => ({
        id: r.id,
        programMeetingId: r.programMeetingId,
        patientId: r.patientId,
        presence: r.presence,
        weightKg: r.weightKg,
        bmi: r.bmi,
        bloodPressureSystolic: r.bloodPressureSystolic,
        bloodPressureDiastolic: r.bloodPressureDiastolic,
        notes: r.notes,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    };
  }
}

