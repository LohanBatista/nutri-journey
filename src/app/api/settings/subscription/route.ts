import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/presentation/auth/config";
import { makeGetOrganizationSubscriptionUseCase } from "@/application/factories/makeGetOrganizationSubscriptionUseCase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.professional || !session?.organization) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const getOrganizationSubscriptionUseCase =
      makeGetOrganizationSubscriptionUseCase();
    const result = await getOrganizationSubscriptionUseCase.execute({
      organizationId: session.organization.id,
    });

    return NextResponse.json({
      subscription: result.subscription
        ? {
            ...result.subscription,
            startDate: result.subscription.startDate.toISOString(),
            endDate: result.subscription.endDate
              ? result.subscription.endDate.toISOString()
              : null,
            createdAt: result.subscription.createdAt.toISOString(),
            updatedAt: result.subscription.updatedAt.toISOString(),
            plan: result.subscription.plan
              ? {
                  ...result.subscription.plan,
                  createdAt: result.subscription.plan.createdAt.toISOString(),
                }
              : null,
          }
        : null,
      plan: result.plan
        ? {
            ...result.plan,
            createdAt: result.plan.createdAt.toISOString(),
          }
        : null,
      limits: result.limits,
    });
  } catch (error) {
    console.error("Erro ao buscar assinatura:", error);
    return NextResponse.json(
      { error: "Erro ao buscar assinatura" },
      { status: 500 }
    );
  }
}

