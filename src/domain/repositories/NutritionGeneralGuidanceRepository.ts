import type {
  NutritionGeneralGuidance,
  CreateNutritionGeneralGuidanceInput,
  UpdateNutritionGeneralGuidanceInput,
} from "../entities/NutritionGeneralGuidance";

export interface NutritionGeneralGuidanceRepository {
  findById(
    id: string,
    organizationId: string
  ): Promise<NutritionGeneralGuidance | null>;
  findLatestByPatient(
    patientId: string,
    organizationId: string
  ): Promise<NutritionGeneralGuidance | null>;
  listByPatient(
    patientId: string,
    organizationId: string
  ): Promise<NutritionGeneralGuidance[]>;
  create(
    data: CreateNutritionGeneralGuidanceInput
  ): Promise<NutritionGeneralGuidance>;
  update(
    id: string,
    data: UpdateNutritionGeneralGuidanceInput
  ): Promise<NutritionGeneralGuidance>;
  delete(id: string): Promise<void>;
}

