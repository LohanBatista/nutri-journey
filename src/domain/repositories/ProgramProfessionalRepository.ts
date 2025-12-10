import type {
  ProgramProfessional,
} from "../entities/Program";

export interface ProgramProfessionalRepository {
  findByProgramId(programId: string): Promise<ProgramProfessional[]>;
  addProfessional(
    programId: string,
    professionalId: string,
    role: "LEAD_NUTRITIONIST" | "NUTRITIONIST" | "OTHER"
  ): Promise<ProgramProfessional>;
  removeProfessional(programId: string, professionalId: string): Promise<void>;
}

