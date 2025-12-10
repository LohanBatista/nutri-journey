import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeCreateAnthropometryRecordUseCase } from "@/application/factories/makeCreateAnthropometryRecordUseCase";
import { makeListPatientAnthropometryRecordsUseCase } from "@/application/factories/makeListPatientAnthropometryRecordsUseCase";

const createAnthropometryRecordSchema = z.object({
  date: z.string().datetime().or(z.date()),
  weightKg: z
    .union([z.number().positive(), z.null()])
    .optional()
    .default(null),
  heightM: z
    .union([z.number().positive(), z.null()])
    .optional()
    .default(null),
  waistCircumference: z
    .union([z.number().positive(), z.null()])
    .optional()
    .default(null),
  hipCircumference: z
    .union([z.number().positive(), z.null()])
    .optional()
    .default(null),
  armCircumference: z
    .union([z.number().positive(), z.null()])
    .optional()
    .default(null),
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

    const listPatientAnthropometryRecordsUseCase = makeListPatientAnthropometryRecordsUseCase();
    const result = await listPatientAnthropometryRecordsUseCase.execute({
      organizationId,
      patientId,
    });

    return NextResponse.json({
      records: result.records.map((r) => ({
        ...r,
        date: r.date.toISOString(),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Erro ao listar registros antropométricos:", error);
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
    const validatedData = createAnthropometryRecordSchema.parse(body);

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

    const createAnthropometryRecordUseCase = makeCreateAnthropometryRecordUseCase();
    const result = await createAnthropometryRecordUseCase.execute({
      organizationId,
      patientId,
      professionalId,
      date:
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date),
      weightKg: validatedData.weightKg ?? null,
      heightM: validatedData.heightM ?? null,
      waistCircumference: validatedData.waistCircumference ?? null,
      hipCircumference: validatedData.hipCircumference ?? null,
      armCircumference: validatedData.armCircumference ?? null,
      notes: validatedData.notes ?? null,
    });

    return NextResponse.json(
      {
        record: {
          ...result.anthropometryRecord,
          date: result.anthropometryRecord.date.toISOString(),
          createdAt: result.anthropometryRecord.createdAt.toISOString(),
          updatedAt: result.anthropometryRecord.updatedAt.toISOString(),
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

    console.error("Erro ao criar registro antropométrico:", error);
    return NextResponse.json(
      { error: "Erro ao criar registro antropométrico" },
      { status: 500 }
    );
  }
}

