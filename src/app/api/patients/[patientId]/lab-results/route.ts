import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeCreateLabResultUseCase } from "@/application/factories/makeCreateLabResultUseCase";
import { makeListPatientLabResultsUseCase } from "@/application/factories/makeListPatientLabResultsUseCase";

const createLabResultSchema = z.object({
  date: z.string().datetime().or(z.date()),
  testType: z.enum(["GLYCEMIA", "HBA1C", "CT", "HDL", "LDL", "TG", "OTHER"]),
  name: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  unit: z.string().min(1),
  referenceRange: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
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

    const listPatientLabResultsUseCase = makeListPatientLabResultsUseCase();
    const result = await listPatientLabResultsUseCase.execute({
      organizationId,
      patientId,
    });

    return NextResponse.json({
      labResults: result.labResults.map((r) => ({
        ...r,
        date: r.date.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Erro ao listar exames laboratoriais:", error);
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
    const validatedData = createLabResultSchema.parse(body);

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

    const createLabResultUseCase = makeCreateLabResultUseCase();
    const result = await createLabResultUseCase.execute({
      organizationId,
      patientId,
      professionalId,
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

    return NextResponse.json(
      {
        labResult: {
          ...result.labResult,
          date: result.labResult.date.toISOString(),
          createdAt: result.labResult.createdAt.toISOString(),
          updatedAt: result.labResult.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar exame laboratorial:", error);
    return NextResponse.json(
      { error: "Erro ao criar exame laboratorial" },
      { status: 500 }
    );
  }
}

