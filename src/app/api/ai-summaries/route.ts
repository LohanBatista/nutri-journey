import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeGeneratePatientSummaryUseCase } from "@/application/factories/makeGeneratePatientSummaryUseCase";
import { PrismaAiSummaryRepository } from "@/infra/repositories/PrismaAiSummaryRepository";

const generateSummarySchema = z.object({
  organizationId: z.string().uuid(),
  professionalId: z.string().uuid(),
  patientId: z.string().uuid(),
  summaryType: z.enum(["WEEKLY_OVERVIEW", "FULL_HISTORY", "PRE_CONSULT"]),
  periodStart: z.string().datetime().or(z.date()).nullable().optional(),
  periodEnd: z.string().datetime().or(z.date()).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateSummarySchema.parse(body);

    const generateSummaryUseCase = makeGeneratePatientSummaryUseCase();
    const result = await generateSummaryUseCase.execute({
      organizationId: validatedData.organizationId,
      professionalId: validatedData.professionalId,
      patientId: validatedData.patientId,
      summaryType: validatedData.summaryType,
      periodStart:
        validatedData.periodStart instanceof Date
          ? validatedData.periodStart
          : validatedData.periodStart
          ? new Date(validatedData.periodStart)
          : null,
      periodEnd:
        validatedData.periodEnd instanceof Date
          ? validatedData.periodEnd
          : validatedData.periodEnd
          ? new Date(validatedData.periodEnd)
          : null,
    });

    return NextResponse.json({
      aiSummary: {
        ...result.aiSummary,
        periodStart: result.aiSummary.periodStart ? result.aiSummary.periodStart.toISOString() : null,
        periodEnd: result.aiSummary.periodEnd ? result.aiSummary.periodEnd.toISOString() : null,
        createdAt: result.aiSummary.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
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
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!patientId || !organizationId) {
      return NextResponse.json(
        { error: "patientId and organizationId are required" },
        { status: 400 }
      );
    }

    const aiSummaryRepository = new PrismaAiSummaryRepository();
    const filters: {
      patientId: string;
      organizationId: string;
      type?: "WEEKLY_OVERVIEW" | "FULL_HISTORY" | "PRE_CONSULT";
      startDate?: Date;
      endDate?: Date;
    } = {
      patientId,
      organizationId,
    };

    if (type) {
      filters.type = type as "WEEKLY_OVERVIEW" | "FULL_HISTORY" | "PRE_CONSULT";
    }
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const summaries = await aiSummaryRepository.listByPatient(filters);

    return NextResponse.json({ 
      summaries: summaries.map((s) => ({
        ...s,
        periodStart: s.periodStart ? s.periodStart.toISOString() : null,
        periodEnd: s.periodEnd ? s.periodEnd.toISOString() : null,
        createdAt: s.createdAt.toISOString(),
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

