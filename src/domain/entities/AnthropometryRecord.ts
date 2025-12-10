export interface AnthropometryRecord {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  weightKg: number | null;
  heightM: number | null;
  bmi: number | null;
  waistCircumference: number | null;
  hipCircumference: number | null;
  armCircumference: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnthropometryRecordInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  weightKg?: number | null;
  heightM?: number | null;
  bmi?: number | null;
  waistCircumference?: number | null;
  hipCircumference?: number | null;
  armCircumference?: number | null;
  notes?: string | null;
}

export interface UpdateAnthropometryRecordInput {
  date?: Date;
  weightKg?: number | null;
  heightM?: number | null;
  bmi?: number | null;
  waistCircumference?: number | null;
  hipCircumference?: number | null;
  armCircumference?: number | null;
  notes?: string | null;
}

export interface AnthropometryRecordListFilters {
  patientId: string;
  startDate?: Date;
  endDate?: Date;
}
