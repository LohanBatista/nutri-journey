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

// IA v2 - Diagnóstico Nutricional
export interface NutritionDiagnosis {
  title: string;
  pesFormat: string | null;
  rationale: string;
}

export interface GenerateNutritionDiagnosisInput {
  patientData: {
    id: string;
    name: string;
    sex: "MALE" | "FEMALE" | "OTHER";
    age: number;
    clinicalDiagnoses: string[];
  };
  recentAnthropometry: {
    date: Date;
    weightKg: number | null;
    bmi: number | null;
    waistCircumference: number | null;
    hipCircumference: number | null;
    armCircumference: number | null;
    previousWeightKg: number | null;
    previousBmi: number | null;
  } | null;
  mainLabResults: {
    date: Date;
    name: string;
    testType: "GLYCEMIA" | "HBA1C" | "CT" | "HDL" | "LDL" | "TG" | "OTHER";
    value: string;
    unit: string;
    referenceRange: string | null;
  }[];
  dietaryPatternSummary: string | null;
}

export interface GenerateNutritionDiagnosisOutput {
  diagnoses: NutritionDiagnosis[];
}

// IA v2 - Material Educativo
export interface GenerateEducationMaterialInput {
  topic: string;
  context: "INDIVIDUAL" | "GROUP";
  patientInfo?: {
    name: string;
    age: number;
    sex: "MALE" | "FEMALE" | "OTHER";
    clinicalConditions: string[];
  };
  programInfo?: {
    name: string;
    description: string;
    targetAudience: string;
  };
}

export interface GenerateEducationMaterialOutput {
  text: string;
}

// IA v2 - Resumo de Programa
export interface GenerateProgramSummaryInput {
  program: {
    id: string;
    name: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
    status: string;
  };
  objectives: string;
  participants: {
    id: string;
    name: string;
    joinDate: Date;
  }[];
  meetings: {
    id: string;
    date: Date;
    topic: string;
    notes: string | null;
    participantsCount: number;
  }[];
  averageEvolution?: {
    averageWeightChange: number | null;
    averageBmiChange: number | null;
    attendanceRate: number;
  } | null;
}

export interface GenerateProgramSummaryOutput {
  text: string;
}
