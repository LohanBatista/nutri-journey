import type { Plan } from "@/domain/entities/Plan";
import type { OrganizationSubscription } from "@/domain/entities/OrganizationSubscription";
import type { SubscriptionRepository } from "@/domain/repositories/SubscriptionRepository";
import { prisma } from "../database/prisma";

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  async findPlanById(id: string): Promise<Plan | null> {
    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      return null;
    }

    return this.planToDomain(plan);
  }

  async findAllPlans(): Promise<Plan[]> {
    const plans = await prisma.plan.findMany({
      orderBy: { monthlyPriceCents: "asc" },
    });

    return plans.map((plan) => this.planToDomain(plan));
  }

  async findSubscriptionByOrganizationId(
    organizationId: string
  ): Promise<OrganizationSubscription | null> {
    const subscription = await prisma.organizationSubscription.findFirst({
      where: { organizationId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return null;
    }

    return this.subscriptionToDomain(subscription);
  }

  async findActiveSubscriptionByOrganizationId(
    organizationId: string
  ): Promise<OrganizationSubscription | null> {
    const subscription = await prisma.organizationSubscription.findFirst({
      where: {
        organizationId,
        status: { in: ["ACTIVE", "TRIAL"] },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return null;
    }

    return this.subscriptionToDomain(subscription);
  }

  private planToDomain(plan: {
    id: string;
    name: string;
    description: string;
    monthlyPriceCents: number;
    maxProfessionals: number | null;
    maxPatients: number | null;
    createdAt: Date;
  }): Plan {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPriceCents: plan.monthlyPriceCents,
      maxProfessionals: plan.maxProfessionals,
      maxPatients: plan.maxPatients,
      createdAt: plan.createdAt,
    };
  }

  private subscriptionToDomain(subscription: {
    id: string;
    organizationId: string;
    planId: string;
    startDate: Date;
    endDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    plan: {
      id: string;
      name: string;
      description: string;
      monthlyPriceCents: number;
      maxProfessionals: number | null;
      maxPatients: number | null;
      createdAt: Date;
    };
  }): OrganizationSubscription {
    return {
      id: subscription.id,
      organizationId: subscription.organizationId,
      planId: subscription.planId,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status as "ACTIVE" | "CANCELLED" | "TRIAL",
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      plan: this.planToDomain(subscription.plan),
    };
  }
}

