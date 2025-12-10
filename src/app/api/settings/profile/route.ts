import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeGetCurrentProfessionalProfileUseCase } from "@/application/factories/makeGetCurrentProfessionalProfileUseCase";
import { makeUpdateProfessionalProfileUseCase } from "@/application/factories/makeUpdateProfessionalProfileUseCase";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
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

    const getCurrentProfessionalProfileUseCase =
      makeGetCurrentProfessionalProfileUseCase();
    const result = await getCurrentProfessionalProfileUseCase.execute({
      professionalId: session.professional.id,
    });

    return NextResponse.json({
      professional: {
        ...result.professional,
        createdAt: result.professional.createdAt.toISOString(),
        updatedAt: result.professional.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao buscar perfil" },
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

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const updateProfessionalProfileUseCase =
      makeUpdateProfessionalProfileUseCase();
    const result = await updateProfessionalProfileUseCase.execute({
      professionalId: session.professional.id,
      name: validatedData.name,
      password: validatedData.password,
    });

    return NextResponse.json({
      professional: {
        ...result.professional,
        createdAt: result.professional.createdAt.toISOString(),
        updatedAt: result.professional.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Professional not found") {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}

