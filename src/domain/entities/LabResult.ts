export type LabTestType =
  | "GLYCEMIA"
  | "HBA1C"
  | "CT"
  | "HDL"
  | "LDL"
  | "TG"
  | "OTHER";

export interface LabResult {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  testType: LabTestType;
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLabResultInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  testType: LabTestType;
  name: string;
  value: number | string;
  unit: string;
  referenceRange?: string | null;
  notes?: string | null;
}

export interface UpdateLabResultInput {
  date?: Date;
  testType?: LabTestType;
  name?: string;
  value?: number | string;
  unit?: string;
  referenceRange?: string | null;
  notes?: string | null;
}

export interface LabResultListFilters {
  patientId: string;
  testType?: LabTestType;
  startDate?: Date;
  endDate?: Date;
}
