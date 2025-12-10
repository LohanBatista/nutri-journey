import type {
  ProgramParticipant,
  AddParticipantToProgramInput,
} from "@/domain/entities/Program";
import type { ProgramParticipantRepository } from "@/domain/repositories/ProgramParticipantRepository";
import { prisma } from "../database/prisma";

export class PrismaProgramParticipantRepository
  implements ProgramParticipantRepository
{
  async findByProgramId(programId: string): Promise<ProgramParticipant[]> {
    const participants = await prisma.programParticipant.findMany({
      where: { programId },
      orderBy: { joinDate: "desc" },
    });

    return participants.map((p) => this.toDomain(p));
  }

  async findByPatientId(patientId: string): Promise<ProgramParticipant[]> {
    const participants = await prisma.programParticipant.findMany({
      where: { patientId },
      orderBy: { joinDate: "desc" },
    });

    return participants.map((p) => this.toDomain(p));
  }

  async findByProgramAndPatient(
    programId: string,
    patientId: string
  ): Promise<ProgramParticipant | null> {
    const participant = await prisma.programParticipant.findUnique({
      where: {
        programId_patientId: {
          programId,
          patientId,
        },
      },
    });

    if (!participant) {
      return null;
    }

    return this.toDomain(participant);
  }

  async addParticipant(
    data: AddParticipantToProgramInput
  ): Promise<ProgramParticipant> {
    const participant = await prisma.programParticipant.create({
      data: {
        programId: data.programId,
        patientId: data.patientId,
        joinDate: new Date(),
        notes: data.notes ?? null,
      },
    });

    return this.toDomain(participant);
  }

  async removeParticipant(
    programId: string,
    patientId: string
  ): Promise<void> {
    await prisma.programParticipant.delete({
      where: {
        programId_patientId: {
          programId,
          patientId,
        },
      },
    });
  }

  async updateParticipant(
    id: string,
    data: {
      leaveDate?: Date | null;
      notes?: string | null;
    }
  ): Promise<ProgramParticipant> {
    const participant = await prisma.programParticipant.update({
      where: { id },
      data: {
        ...(data.leaveDate !== undefined && { leaveDate: data.leaveDate }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return this.toDomain(participant);
  }

  private toDomain(participant: any): ProgramParticipant {
    return {
      id: participant.id,
      programId: participant.programId,
      patientId: participant.patientId,
      joinDate: participant.joinDate,
      leaveDate: participant.leaveDate,
      notes: participant.notes,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
    };
  }
}

