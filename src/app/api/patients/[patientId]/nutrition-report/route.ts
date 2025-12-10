import { NextRequest, NextResponse } from "next/server";
import { makeGeneratePatientNutritionReportUseCase } from "@/application/factories/makeGeneratePatientNutritionReportUseCase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const generatePatientNutritionReportUseCase =
      makeGeneratePatientNutritionReportUseCase();
    const result = await generatePatientNutritionReportUseCase.execute({
      organizationId,
      patientId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Paciente não encontrado") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
