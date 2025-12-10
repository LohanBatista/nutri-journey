import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreateAnthropometryRecordUseCase } from "@/application/factories/makeCreateAnthropometryRecordUseCase";

const createAnthropometryRecordSchema = z.object({
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  date: z.string().datetime().or(z.date()),
  weightKg: z.number().nullable().optional(),
  heightM: z.number().nullable().optional(),
  bmi: z.number().nullable().optional(),
  waistCircumference: z.number().nullable().optional(),
  hipCircumference: z.number().nullable().optional(),
  armCircumference: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAnthropometryRecordSchema.parse(body);

    const createAnthropometryRecordUseCase =
      makeCreateAnthropometryRecordUseCase();
    const result = await createAnthropometryRecordUseCase.execute({
      organizationId: validatedData.organizationId,
      patientId: validatedData.patientId,
      professionalId: validatedData.professionalId,
      date:
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date),
      ...(validatedData.weightKg !== undefined && { weightKg: validatedData.weightKg }),
      ...(validatedData.heightM !== undefined && { heightM: validatedData.heightM }),
      ...(validatedData.bmi !== undefined && { bmi: validatedData.bmi }),
      ...(validatedData.waistCircumference !== undefined && { waistCircumference: validatedData.waistCircumference }),
      ...(validatedData.hipCircumference !== undefined && { hipCircumference: validatedData.hipCircumference }),
      ...(validatedData.armCircumference !== undefined && { armCircumference: validatedData.armCircumference }),
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

