import type {
  AiEducationMaterial,
  CreateAiEducationMaterialInput,
  AiEducationMaterialListFilters,
} from "../entities/AiEducationMaterial";

export interface AiEducationMaterialRepository {
  findById(
    id: string,
    organizationId: string
  ): Promise<AiEducationMaterial | null>;
  listByOrganization(
    filters: AiEducationMaterialListFilters
  ): Promise<AiEducationMaterial[]>;
  create(data: CreateAiEducationMaterialInput): Promise<AiEducationMaterial>;
  delete(id: string): Promise<void>;
}

