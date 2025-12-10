import type {
  ProgramMeetingRecord,
  RecordProgramMeetingInput,
} from "../entities/Program";

export interface ProgramMeetingRecordRepository {
  findByMeetingId(meetingId: string): Promise<ProgramMeetingRecord[]>;
  findByMeetingAndPatient(
    meetingId: string,
    patientId: string
  ): Promise<ProgramMeetingRecord | null>;
  createOrUpdate(data: RecordProgramMeetingInput): Promise<ProgramMeetingRecord>;
  delete(id: string): Promise<void>;
}

