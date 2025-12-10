import type { Plan } from "../entities/Plan";
import type { OrganizationSubscription } from "../entities/OrganizationSubscription";

export interface SubscriptionRepository {
  findPlanById(id: string): Promise<Plan | null>;
  findAllPlans(): Promise<Plan[]>;
  findSubscriptionByOrganizationId(
    organizationId: string
  ): Promise<OrganizationSubscription | null>;
  findActiveSubscriptionByOrganizationId(
    organizationId: string
  ): Promise<OrganizationSubscription | null>;
}

