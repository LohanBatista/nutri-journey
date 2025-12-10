import type { Plan } from "./Plan";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "TRIAL";

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  startDate: Date;
  endDate: Date | null;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
  plan?: Plan;
}

