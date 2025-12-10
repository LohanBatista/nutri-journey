export type ConsultationType = "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";

export interface Consultation {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  dateTime: Date;
  type: ConsultationType;
  mainComplaint: string | null;
  nutritionHistory: string | null;
  clinicalHistory: string | null;
  objectiveData: string | null;
  nutritionDiagnosis: string | null;
  plan: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConsultationInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  dateTime: Date;
  type: ConsultationType;
  mainComplaint?: string | null;
  nutritionHistory?: string | null;
  clinicalHistory?: string | null;
  objectiveData?: string | null;
  nutritionDiagnosis?: string | null;
  plan?: string | null;
}

export interface UpdateConsultationInput {
  dateTime?: Date;
  type?: ConsultationType;
  mainComplaint?: string | null;
  nutritionHistory?: string | null;
  clinicalHistory?: string | null;
  objectiveData?: string | null;
  nutritionDiagnosis?: string | null;
  plan?: string | null;
}

export interface ConsultationListFilters {
  patientId?: string;
  professionalId?: string;
  type?: ConsultationType;
  startDate?: Date;
  endDate?: Date;
}
