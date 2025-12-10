import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeGenerateProgramSummaryUseCase } from "@/application/factories/makeGenerateProgramSummaryUseCase";
import { PrismaAiProgramSummaryRepository } from "@/infra/repositories/PrismaAiProgramSummaryRepository";

const generateProgramSummarySchema = z.object({
  organizationId: z.string().uuid(),
  programId: z.string().uuid(),
  type: z.enum(["MEETING_SUMMARY", "PROGRAM_OVERVIEW"]),
  meetingId: z.string().uuid().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateProgramSummarySchema.parse(body);

    const generateSummaryUseCase = makeGenerateProgramSummaryUseCase();
    const result = await generateSummaryUseCase.execute({
      organizationId: validatedData.organizationId,
      programId: validatedData.programId,
      type: validatedData.type,
      meetingId: validatedData.meetingId ?? null,
    });

    return NextResponse.json({
      summary: {
        ...result.summary,
        createdAt: result.summary.createdAt.toISOString(),
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
    const programId = searchParams.get("programId");
    const organizationId = searchParams.get("organizationId");
    const type = searchParams.get("type");
    const meetingId = searchParams.get("meetingId");

    if (!programId || !organizationId) {
      return NextResponse.json(
        { error: "programId and organizationId are required" },
        { status: 400 }
      );
    }

    const repository = new PrismaAiProgramSummaryRepository();
    const filters: {
      programId: string;
      organizationId: string;
      type?: "MEETING_SUMMARY" | "PROGRAM_OVERVIEW";
      meetingId?: string | null;
    } = {
      programId,
      organizationId,
    };

    if (type) {
      filters.type = type as "MEETING_SUMMARY" | "PROGRAM_OVERVIEW";
    }

    // searchParams.get() returns string | null, and we need to handle it
    if (meetingId !== null) {
      filters.meetingId = meetingId;
    }

    const summaries = await repository.listByOrganization(filters);

    return NextResponse.json({
      summaries: summaries.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

