export interface Consultation {
  id: string;
  patientId: string;
  professionalId: string;
  date: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationCreateInput {
  patientId: string;
  professionalId: string;
  date: Date;
  notes?: string;
}

export interface ConsultationUpdateInput {
  date?: Date;
  notes?: string;
}
