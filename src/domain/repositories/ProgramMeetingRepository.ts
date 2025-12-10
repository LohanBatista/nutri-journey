import type {
  ProgramMeeting,
  CreateProgramMeetingInput,
} from "../entities/Program";

export interface ProgramMeetingRepository {
  findById(id: string): Promise<ProgramMeeting | null>;
  findByProgramId(programId: string): Promise<ProgramMeeting[]>;
  create(data: CreateProgramMeetingInput): Promise<ProgramMeeting>;
  update(
    id: string,
    data: {
      date?: Date;
      topic?: string;
      notes?: string | null;
    }
  ): Promise<ProgramMeeting>;
  delete(id: string): Promise<void>;
}

