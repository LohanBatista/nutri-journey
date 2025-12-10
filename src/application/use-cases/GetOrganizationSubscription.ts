import type { SubscriptionRepository } from "@/domain/repositories/SubscriptionRepository";
import type { OrganizationSubscription } from "@/domain/entities/OrganizationSubscription";
import type { Plan } from "@/domain/entities/Plan";

export interface GetOrganizationSubscriptionInput {
  organizationId: string;
}

export interface GetOrganizationSubscriptionOutput {
  subscription: OrganizationSubscription | null;
  plan: Plan | null;
  limits: {
    maxProfessionals: number | null;
    maxPatients: number | null;
  };
}

export class GetOrganizationSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async execute(
    input: GetOrganizationSubscriptionInput
  ): Promise<GetOrganizationSubscriptionOutput> {
    const subscription =
      await this.subscriptionRepository.findActiveSubscriptionByOrganizationId(
        input.organizationId
      );

    let plan: Plan | null = null;
    if (subscription) {
      plan = await this.subscriptionRepository.findPlanById(
        subscription.planId
      );
    }

    return {
      subscription,
      plan,
      limits: {
        maxProfessionals: plan?.maxProfessionals ?? null,
        maxPatients: plan?.maxPatients ?? null,
      },
    };
  }
}

