import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreateNutritionGeneralGuidanceUseCase } from "@/application/factories/makeCreateNutritionGeneralGuidanceUseCase";
import { PrismaNutritionGeneralGuidanceRepository } from "@/infra/repositories/PrismaNutritionGeneralGuidanceRepository";

const createNutritionGeneralGuidanceSchema = z.object({
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  date: z.string().datetime().or(z.date()),
  hydrationGuidance: z.string().nullable().optional(),
  physicalActivityGuidance: z.string().nullable().optional(),
  sleepGuidance: z.string().nullable().optional(),
  symptomManagementGuidance: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createNutritionGeneralGuidanceSchema.parse(body);

    const createNutritionGeneralGuidanceUseCase =
      makeCreateNutritionGeneralGuidanceUseCase();
    const result = await createNutritionGeneralGuidanceUseCase.execute({
      organizationId: validatedData.organizationId,
      patientId: validatedData.patientId,
      professionalId: validatedData.professionalId,
      date:
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date),
      ...(validatedData.hydrationGuidance !== undefined && { hydrationGuidance: validatedData.hydrationGuidance }),
      ...(validatedData.physicalActivityGuidance !== undefined && { physicalActivityGuidance: validatedData.physicalActivityGuidance }),
      ...(validatedData.sleepGuidance !== undefined && { sleepGuidance: validatedData.sleepGuidance }),
      ...(validatedData.symptomManagementGuidance !== undefined && { symptomManagementGuidance: validatedData.symptomManagementGuidance }),
      ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const organizationId = searchParams.get("organizationId");

    if (!patientId || !organizationId) {
      return NextResponse.json(
        { error: "patientId and organizationId are required" },
        { status: 400 }
      );
    }

    const repository = new PrismaNutritionGeneralGuidanceRepository();
    const latestGuidance = await repository.findLatestByPatient(
      patientId,
      organizationId
    );

    return NextResponse.json({ guidance: latestGuidance });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

