export interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: Date | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientCreateInput {
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  organizationId: string;
}

export interface PatientUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
}
