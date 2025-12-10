import { GetOrganizationSubscriptionUseCase } from "../use-cases/GetOrganizationSubscription";
import { PrismaSubscriptionRepository } from "@/infra/repositories/PrismaSubscriptionRepository";

export function makeGetOrganizationSubscriptionUseCase(): GetOrganizationSubscriptionUseCase {
  const subscriptionRepository = new PrismaSubscriptionRepository();
  return new GetOrganizationSubscriptionUseCase(subscriptionRepository);
}

