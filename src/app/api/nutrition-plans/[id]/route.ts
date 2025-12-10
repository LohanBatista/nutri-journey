import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeUpdateNutritionPlanUseCase } from "@/application/factories/makeUpdateNutritionPlanUseCase";
import { makeGetActiveNutritionPlanUseCase } from "@/application/factories/makeGetActiveNutritionPlanUseCase";

const updateNutritionPlanSchema = z.object({
  title: z.string().min(1).optional(),
  goals: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateNutritionPlanSchema.parse(body);

    const organizationId = request.headers.get("x-organization-id");
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId header is required" },
        { status: 400 }
      );
    }

    const updateNutritionPlanUseCase = makeUpdateNutritionPlanUseCase();
    const result = await updateNutritionPlanUseCase.execute(
      id,
      organizationId,
      {
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.goals !== undefined && { goals: validatedData.goals }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Plano nutricional não encontrado"
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const organizationId = searchParams.get("organizationId");

    if (!patientId || !organizationId) {
      return NextResponse.json(
        { error: "patientId and organizationId are required" },
        { status: 400 }
      );
    }

    const getActiveNutritionPlanUseCase = makeGetActiveNutritionPlanUseCase();
    const result = await getActiveNutritionPlanUseCase.execute({
      patientId,
      organizationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
