import type {
  NutritionPlan,
  CreateNutritionPlanInput,
  UpdateNutritionPlanInput,
} from "../entities/NutritionPlan";

export interface NutritionPlanRepository {
  findById(id: string, organizationId: string): Promise<NutritionPlan | null>;
  findActiveByPatient(
    patientId: string,
    organizationId: string
  ): Promise<NutritionPlan | null>;
  listByPatient(
    patientId: string,
    organizationId: string
  ): Promise<NutritionPlan[]>;
  create(data: CreateNutritionPlanInput): Promise<NutritionPlan>;
  update(id: string, data: UpdateNutritionPlanInput): Promise<NutritionPlan>;
  delete(id: string): Promise<void>;
}
