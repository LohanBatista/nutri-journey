import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/presentation/auth/config";
import { makeGetOrganizationAnalyticsUseCase } from "@/application/factories/makeGetOrganizationAnalyticsUseCase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.professional || !session?.organization) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const input: {
      organizationId: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      organizationId: session.organization.id,
    };

    if (startDateParam) {
      input.startDate = new Date(startDateParam);
    }

    if (endDateParam) {
      input.endDate = new Date(endDateParam);
    }

    const getOrganizationAnalyticsUseCase =
      makeGetOrganizationAnalyticsUseCase();
    const result = await getOrganizationAnalyticsUseCase.execute(input);

    return NextResponse.json({
      analytics: result,
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar analytics" },
      { status: 500 }
    );
  }
}

