import type { ProgramProfessional } from "@/domain/entities/Program";
import type { ProgramProfessionalRepository } from "@/domain/repositories/ProgramProfessionalRepository";
import { prisma } from "../database/prisma";

export class PrismaProgramProfessionalRepository
  implements ProgramProfessionalRepository
{
  async findByProgramId(programId: string): Promise<ProgramProfessional[]> {
    const professionals = await prisma.programProfessional.findMany({
      where: { programId },
      orderBy: { createdAt: "desc" },
    });

    return professionals.map((p) => this.toDomain(p));
  }

  async addProfessional(
    programId: string,
    professionalId: string,
    role: "LEAD_NUTRITIONIST" | "NUTRITIONIST" | "OTHER"
  ): Promise<ProgramProfessional> {
    const programProfessional = await prisma.programProfessional.create({
      data: {
        programId,
        professionalId,
        role,
      },
    });

    return this.toDomain(programProfessional);
  }

  async removeProfessional(
    programId: string,
    professionalId: string
  ): Promise<void> {
    await prisma.programProfessional.delete({
      where: {
        programId_professionalId: {
          programId,
          professionalId,
        },
      },
    });
  }

  private toDomain(programProfessional: any): ProgramProfessional {
    return {
      id: programProfessional.id,
      programId: programProfessional.programId,
      professionalId: programProfessional.professionalId,
      role: programProfessional.role as
        | "LEAD_NUTRITIONIST"
        | "NUTRITIONIST"
        | "OTHER",
      createdAt: programProfessional.createdAt,
      updatedAt: programProfessional.updatedAt,
    };
  }
}

