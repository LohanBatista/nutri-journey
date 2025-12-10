import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeGetOrganizationProfileUseCase } from "@/application/factories/makeGetOrganizationProfileUseCase";
import { makeUpdateOrganizationProfileUseCase } from "@/application/factories/makeUpdateOrganizationProfileUseCase";

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
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

    const getOrganizationProfileUseCase = makeGetOrganizationProfileUseCase();
    const result = await getOrganizationProfileUseCase.execute({
      organizationId: session.organization.id,
    });

    return NextResponse.json({
      organization: {
        ...result.organization,
        createdAt: result.organization.createdAt.toISOString(),
        updatedAt: result.organization.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar organização:", error);
    return NextResponse.json(
      { error: "Erro ao buscar organização" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.professional || !session?.organization) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário é ADMIN
    if (session.professional.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem atualizar a organização" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateOrganizationSchema.parse(body);

    const updateOrganizationProfileUseCase =
      makeUpdateOrganizationProfileUseCase();
    const result = await updateOrganizationProfileUseCase.execute({
      organizationId: session.organization.id,
      name: validatedData.name,
    });

    return NextResponse.json({
      organization: {
        ...result.organization,
        createdAt: result.organization.createdAt.toISOString(),
        updatedAt: result.organization.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Organization not found") {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error("Erro ao atualizar organização:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar organização" },
      { status: 500 }
    );
  }
}

