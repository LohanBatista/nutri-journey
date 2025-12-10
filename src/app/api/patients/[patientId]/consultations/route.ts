import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeCreateConsultationUseCase } from "@/application/factories/makeCreateConsultationUseCase";
import { makeListPatientConsultationsUseCase } from "@/application/factories/makeListPatientConsultationsUseCase";

const createConsultationSchema = z.object({
  dateTime: z.string().datetime().or(z.date()),
  type: z.enum(["INITIAL", "FOLLOW_UP", "GROUP", "HOSPITAL"]),
  mainComplaint: z.string().nullable().optional(),
  nutritionHistory: z.string().nullable().optional(),
  clinicalHistory: z.string().nullable().optional(),
  objectiveData: z.string().nullable().optional(),
  nutritionDiagnosis: z.string().nullable().optional(),
  plan: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const session = await auth();
    
    // Tentar obter organizationId da sessão ou do query param
    const { searchParams } = new URL(request.url);
    const organizationId = session?.organization?.id || searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const listPatientConsultationsUseCase = makeListPatientConsultationsUseCase();
    const result = await listPatientConsultationsUseCase.execute({
      organizationId,
      patientId,
    });

    return NextResponse.json({
      consultations: result.consultations.map((c) => ({
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const session = await auth();
    const body = await request.json();
    const validatedData = createConsultationSchema.parse(body);

    // Tentar obter organizationId e professionalId da sessão ou do body
    const organizationId = session?.organization?.id || body.organizationId;
    const professionalId = session?.professional?.id || body.professionalId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    if (!professionalId) {
      return NextResponse.json(
        { error: "professionalId is required" },
        { status: 400 }
      );
    }

    const createConsultationUseCase = makeCreateConsultationUseCase();
    const result = await createConsultationUseCase.execute({
      organizationId,
      patientId,
      professionalId,
      dateTime:
        validatedData.dateTime instanceof Date
          ? validatedData.dateTime
          : new Date(validatedData.dateTime),
      type: validatedData.type,
      ...(validatedData.mainComplaint !== undefined && {
        mainComplaint: validatedData.mainComplaint,
      }),
      ...(validatedData.nutritionHistory !== undefined && {
        nutritionHistory: validatedData.nutritionHistory,
      }),
      ...(validatedData.clinicalHistory !== undefined && {
        clinicalHistory: validatedData.clinicalHistory,
      }),
      ...(validatedData.objectiveData !== undefined && {
        objectiveData: validatedData.objectiveData,
      }),
      ...(validatedData.nutritionDiagnosis !== undefined && {
        nutritionDiagnosis: validatedData.nutritionDiagnosis,
      }),
      ...(validatedData.plan !== undefined && { plan: validatedData.plan }),
    });

    return NextResponse.json(
      {
        consultation: {
          ...result.consultation,
          dateTime: result.consultation.dateTime.toISOString(),
          createdAt: result.consultation.createdAt.toISOString(),
          updatedAt: result.consultation.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
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

