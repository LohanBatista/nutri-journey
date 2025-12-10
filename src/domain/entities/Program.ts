export type ProgramStatus = "PLANNED" | "ACTIVE" | "FINISHED";

export type ProgramProfessionalRole =
  | "LEAD_NUTRITIONIST"
  | "NUTRITIONIST"
  | "OTHER";

export interface Program {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  status: ProgramStatus;
  createdAt: Date;
  updatedAt: Date;
  professionals?: ProgramProfessional[];
  participants?: ProgramParticipant[];
  meetings?: ProgramMeeting[];
}

export interface ProgramProfessional {
  id: string;
  programId: string;
  professionalId: string;
  role: ProgramProfessionalRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramParticipant {
  id: string;
  programId: string;
  patientId: string;
  joinDate: Date;
  leaveDate: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramMeeting {
  id: string;
  programId: string;
  date: Date;
  topic: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  records?: ProgramMeetingRecord[];
}

export interface ProgramMeetingRecord {
  id: string;
  programMeetingId: string;
  patientId: string;
  presence: boolean;
  weightKg: number | null;
  bmi: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProgramInput {
  organizationId: string;
  name: string;
  description: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: ProgramStatus;
  professionalIds?: string[];
}

export interface UpdateProgramInput {
  name?: string;
  description?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: ProgramStatus;
}

export interface AddParticipantToProgramInput {
  programId: string;
  patientId: string;
  notes?: string | null;
}

export interface RemoveParticipantFromProgramInput {
  programId: string;
  patientId: string;
}

export interface CreateProgramMeetingInput {
  programId: string;
  date: Date;
  topic: string;
  notes?: string | null;
}

export interface RecordProgramMeetingInput {
  programMeetingId: string;
  patientId: string;
  presence: boolean;
  weightKg?: number | null;
  bmi?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  notes?: string | null;
}

export interface ProgramListFilters {
  status?: ProgramStatus;
  search?: string;
}

