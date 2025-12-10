import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreateConsultationUseCase } from "@/application/factories/makeCreateConsultationUseCase";
import { PrismaConsultationRepository } from "@/infra/repositories/PrismaConsultationRepository";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const patientId = searchParams.get("patientId");
    const professionalId = searchParams.get("professionalId");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const repository = new PrismaConsultationRepository();
    const filters: {
      patientId?: string;
      professionalId?: string;
      type?: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (patientId) {
      filters.patientId = patientId;
    }
    if (professionalId) {
      filters.professionalId = professionalId;
    }
    if (type) {
      filters.type = type as "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
    }
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const consultations = await repository.listByOrganization(organizationId, filters);

    return NextResponse.json({
      consultations: consultations.map((c) => ({
        ...c,
        dateTime: c.dateTime.toISOString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

