import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreateConsultationUseCase } from "@/application/factories/makeCreateConsultationUseCase";

const createConsultationSchema = z.object({
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  dateTime: z.string().datetime().or(z.date()),
  type: z.enum(["INITIAL", "FOLLOW_UP", "GROUP", "HOSPITAL"]),
  mainComplaint: z.string().nullable().optional(),
  nutritionHistory: z.string().nullable().optional(),
  clinicalHistory: z.string().nullable().optional(),
  objectiveData: z.string().nullable().optional(),
  nutritionDiagnosis: z.string().nullable().optional(),
  plan: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createConsultationSchema.parse(body);

    const createConsultationUseCase = makeCreateConsultationUseCase();
    const result = await createConsultationUseCase.execute({
      organizationId: validatedData.organizationId,
      patientId: validatedData.patientId,
      professionalId: validatedData.professionalId,
      dateTime:
        validatedData.dateTime instanceof Date
          ? validatedData.dateTime
          : new Date(validatedData.dateTime),
      type: validatedData.type,
      ...(validatedData.mainComplaint !== undefined && { mainComplaint: validatedData.mainComplaint }),
      ...(validatedData.nutritionHistory !== undefined && { nutritionHistory: validatedData.nutritionHistory }),
      ...(validatedData.clinicalHistory !== undefined && { clinicalHistory: validatedData.clinicalHistory }),
      ...(validatedData.objectiveData !== undefined && { objectiveData: validatedData.objectiveData }),
      ...(validatedData.nutritionDiagnosis !== undefined && { nutritionDiagnosis: validatedData.nutritionDiagnosis }),
      ...(validatedData.plan !== undefined && { plan: validatedData.plan }),
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

