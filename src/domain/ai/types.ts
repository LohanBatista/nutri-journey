export type AiSummaryType = "WEEKLY_OVERVIEW" | "FULL_HISTORY" | "PRE_CONSULT";

export interface PatientSummaryInfo {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE" | "OTHER";
  approximateAge: number;
  clinicalDiagnoses: string[];
}

export interface ConsultationSummary {
  date: Date;
  type: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
  summary: string;
}

export interface AnthropometryRecordSummary {
  date: Date;
  weightKg: number | null;
  bmi: number | null;
  waistCircumference: number | null;
}

export interface LabResultSummary {
  date: Date;
  testType: "GLYCEMIA" | "HBA1C" | "CT" | "HDL" | "LDL" | "TG" | "OTHER";
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string | null;
}

export interface ActiveNutritionPlanSummary {
  title: string;
  goals: string;
}

export interface GeneratePatientSummaryInput {
  patient: PatientSummaryInfo;
  consultations: ConsultationSummary[];
  anthropometryRecords: AnthropometryRecordSummary[];
  labResults: LabResultSummary[];
  activeNutritionPlan: ActiveNutritionPlanSummary | null;
}

export interface GeneratePatientSummaryOutput {
  textForProfessional: string;
}

