export type PatientSex = "MALE" | "FEMALE" | "OTHER";

export interface Patient {
  id: string;
  organizationId: string;
  fullName: string;
  dateOfBirth: Date;
  sex: PatientSex;
  phone: string | null;
  email: string | null;
  tags: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientInput {
  organizationId: string;
  fullName: string;
  dateOfBirth: Date;
  sex: PatientSex;
  phone?: string | null;
  email?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface UpdatePatientInput {
  fullName?: string;
  dateOfBirth?: Date;
  sex?: PatientSex;
  phone?: string | null;
  email?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface PatientListFilters {
  search?: string;
  tags?: string[];
  sex?: PatientSex;
}
