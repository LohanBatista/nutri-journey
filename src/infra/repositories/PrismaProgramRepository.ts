import type {
  Program,
  CreateProgramInput,
  UpdateProgramInput,
  ProgramListFilters,
} from "@/domain/entities/Program";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";
import { prisma } from "../database/prisma";

export class PrismaProgramRepository implements ProgramRepository {
  async findById(id: string, organizationId: string): Promise<Program | null> {
    const program = await prisma.program.findFirst({
      where: { id, organizationId },
      include: {
        professionals: {
          include: {
            professional: true,
          },
        },
        participants: {
          include: {
            patient: true,
          },
        },
        meetings: {
          include: {
            records: true,
          },
        },
      },
    });

    if (!program) {
      return null;
    }

    return this.toDomain(program);
  }

  async listByOrganization(
    organizationId: string,
    filters?: ProgramListFilters
  ): Promise<Program[]> {
    const where: {
      organizationId: string;
      status?: string;
      name?: { contains: string; mode?: "insensitive" };
    } = {
      organizationId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    const programs = await prisma.program.findMany({
      where,
      include: {
        professionals: true,
        participants: true,
        meetings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return programs.map((program) => this.toDomain(program));
  }

  async create(data: CreateProgramInput): Promise<Program> {
    const program = await prisma.program.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        status: data.status ?? "PLANNED",
        organizationId: data.organizationId,
      },
      include: {
        professionals: true,
        participants: true,
        meetings: true,
      },
    });

    return this.toDomain(program);
  }

  async update(id: string, data: UpdateProgramInput): Promise<Program> {
    const program = await prisma.program.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        professionals: true,
        participants: true,
        meetings: true,
      },
    });

    return this.toDomain(program);
  }

  async delete(id: string): Promise<void> {
    await prisma.program.delete({
      where: { id },
    });
  }

  private toDomain(program: any): Program {
    return {
      id: program.id,
      organizationId: program.organizationId,
      name: program.name,
      description: program.description,
      startDate: program.startDate,
      endDate: program.endDate,
      status: program.status as "PLANNED" | "ACTIVE" | "FINISHED",
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
      professionals: program.professionals?.map((pp: any) => ({
        id: pp.id,
        programId: pp.programId,
        professionalId: pp.professionalId,
        role: pp.role as "LEAD_NUTRITIONIST" | "NUTRITIONIST" | "OTHER",
        createdAt: pp.createdAt,
        updatedAt: pp.updatedAt,
      })),
      participants: program.participants?.map((p: any) => ({
        id: p.id,
        programId: p.programId,
        patientId: p.patientId,
        joinDate: p.joinDate,
        leaveDate: p.leaveDate,
        notes: p.notes,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      meetings: program.meetings?.map((m: any) => ({
        id: m.id,
        programId: m.programId,
        date: m.date,
        topic: m.topic,
        notes: m.notes,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        records: m.records?.map((r: any) => ({
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
      })),
    };
  }
}

