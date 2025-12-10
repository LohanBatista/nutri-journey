import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeGetOrganizationAnalyticsUseCase } from "@/application/factories/makeGetOrganizationAnalyticsUseCase";

const analyticsQuerySchema = z.object({
  startDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Data inválida" }
    )
    .optional(),
  endDate: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Data inválida" }
    )
    .optional(),
});

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
    const queryParams = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const validatedParams = analyticsQuerySchema.parse(queryParams);

    const input: {
      organizationId: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      organizationId: session.organization.id,
    };

    if (validatedParams.startDate) {
      input.startDate = new Date(validatedParams.startDate);
    }

    if (validatedParams.endDate) {
      input.endDate = new Date(validatedParams.endDate);
    }

    // Validar que se uma data for fornecida, a outra também deve ser
    if (
      (input.startDate && !input.endDate) ||
      (!input.startDate && input.endDate)
    ) {
      return NextResponse.json(
        { error: "Ambas as datas (startDate e endDate) devem ser fornecidas juntas" },
        { status: 400 }
      );
    }

    // Validar que startDate não seja maior que endDate
    if (input.startDate && input.endDate && input.startDate > input.endDate) {
      return NextResponse.json(
        { error: "startDate não pode ser maior que endDate" },
        { status: 400 }
      );
    }

    const getOrganizationAnalyticsUseCase =
      makeGetOrganizationAnalyticsUseCase();
    const result = await getOrganizationAnalyticsUseCase.execute(input);

    return NextResponse.json({
      analytics: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Parâmetros inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar analytics" },
      { status: 500 }
    );
  }
}

