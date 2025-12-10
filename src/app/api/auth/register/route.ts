import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeRegisterProfessionalUseCase } from "@/application/factories/makeRegisterProfessionalUseCase";

const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  organizationName: z.string().min(1, "Nome da organização é obrigatório"),
  role: z.enum(["ADMIN", "PROFESSIONAL"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const registerUseCase = makeRegisterProfessionalUseCase();
    const result = await registerUseCase.execute({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      organizationName: validatedData.organizationName,
      ...(validatedData.role && { role: validatedData.role }),
    });

    // Retornar apenas dados necessários (sem passwordHash)
    return NextResponse.json(
      {
        professional: {
          id: result.professional.id,
          name: result.professional.name,
          email: result.professional.email,
          role: result.professional.role,
          organizationId: result.professional.organizationId,
          createdAt: result.professional.createdAt,
          updatedAt: result.professional.updatedAt,
        },
        organization: result.organization,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Erro de validação", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === "Email já está em uso") {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

