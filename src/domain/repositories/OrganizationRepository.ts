import type {
  Organization,
  OrganizationCreateInput,
  OrganizationUpdateInput,
} from "../entities/Organization";

export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  create(data: OrganizationCreateInput): Promise<Organization>;
  update(id: string, data: OrganizationUpdateInput): Promise<Organization>;
  delete(id: string): Promise<void>;
}
