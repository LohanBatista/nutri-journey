import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeGeneratePatientNutritionReportUseCase } from "@/application/factories/makeGeneratePatientNutritionReportUseCase";

const patientIdSchema = z.string().uuid();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.professional || !session?.organization) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { patientId } = await params;

    // Validar formato do patientId
    const validatedPatientId = patientIdSchema.parse(patientId);

    const generatePatientNutritionReportUseCase =
      makeGeneratePatientNutritionReportUseCase();
    const result = await generatePatientNutritionReportUseCase.execute({
      organizationId: session.organization.id,
      patientId: validatedPatientId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ID do paciente inválido", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Paciente não encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Erro ao gerar relatório de paciente:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
