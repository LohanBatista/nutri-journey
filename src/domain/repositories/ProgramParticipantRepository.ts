import type {
  ProgramParticipant,
  AddParticipantToProgramInput,
} from "../entities/Program";

export interface ProgramParticipantRepository {
  findByProgramId(programId: string): Promise<ProgramParticipant[]>;
  findByPatientId(patientId: string): Promise<ProgramParticipant[]>;
  findByProgramAndPatient(
    programId: string,
    patientId: string
  ): Promise<ProgramParticipant | null>;
  addParticipant(data: AddParticipantToProgramInput): Promise<ProgramParticipant>;
  removeParticipant(
    programId: string,
    patientId: string
  ): Promise<void>;
  updateParticipant(
    id: string,
    data: {
      leaveDate?: Date | null;
      notes?: string | null;
    }
  ): Promise<ProgramParticipant>;
}

