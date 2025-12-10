import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreateLabResultUseCase } from "@/application/factories/makeCreateLabResultUseCase";

const createLabResultSchema = z.object({
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  date: z.string().datetime().or(z.date()),
  testType: z.enum(["GLYCEMIA", "HBA1C", "CT", "HDL", "LDL", "TG", "OTHER"]),
  name: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  unit: z.string().min(1),
  referenceRange: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLabResultSchema.parse(body);

    const createLabResultUseCase = makeCreateLabResultUseCase();
    const result = await createLabResultUseCase.execute({
      organizationId: validatedData.organizationId,
      patientId: validatedData.patientId,
      professionalId: validatedData.professionalId,
      date:
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date),
      testType: validatedData.testType,
      name: validatedData.name,
      value: validatedData.value,
      unit: validatedData.unit,
      referenceRange: validatedData.referenceRange ?? null,
      notes: validatedData.notes ?? null,
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

