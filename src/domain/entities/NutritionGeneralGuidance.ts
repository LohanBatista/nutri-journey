export interface NutritionGeneralGuidance {
  id: string;
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  hydrationGuidance: string | null;
  physicalActivityGuidance: string | null;
  sleepGuidance: string | null;
  symptomManagementGuidance: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNutritionGeneralGuidanceInput {
  organizationId: string;
  patientId: string;
  professionalId: string;
  date: Date;
  hydrationGuidance?: string | null;
  physicalActivityGuidance?: string | null;
  sleepGuidance?: string | null;
  symptomManagementGuidance?: string | null;
  notes?: string | null;
}

export interface UpdateNutritionGeneralGuidanceInput {
  date?: Date;
  hydrationGuidance?: string | null;
  physicalActivityGuidance?: string | null;
  sleepGuidance?: string | null;
  symptomManagementGuidance?: string | null;
  notes?: string | null;
}
