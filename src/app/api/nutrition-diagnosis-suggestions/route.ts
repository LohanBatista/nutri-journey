import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeGenerateNutritionDiagnosisSuggestionsUseCase } from "@/application/factories/makeGenerateNutritionDiagnosisSuggestionsUseCase";
import { PrismaAiNutritionDiagnosisSuggestionRepository } from "@/infra/repositories/PrismaAiNutritionDiagnosisSuggestionRepository";

const generateDiagnosisSchema = z.object({
  organizationId: z.string().uuid(),
  professionalId: z.string().uuid(),
  patientId: z.string().uuid(),
  consultationId: z.string().uuid().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateDiagnosisSchema.parse(body);

    const generateDiagnosisUseCase = makeGenerateNutritionDiagnosisSuggestionsUseCase();
    const result = await generateDiagnosisUseCase.execute({
      organizationId: validatedData.organizationId,
      professionalId: validatedData.professionalId,
      patientId: validatedData.patientId,
      consultationId: validatedData.consultationId ?? null,
    });

    return NextResponse.json({
      suggestion: {
        ...result.suggestion,
        createdAt: result.suggestion.createdAt.toISOString(),
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
    const consultationId = searchParams.get("consultationId");

    if (!patientId || !organizationId) {
      return NextResponse.json(
        { error: "patientId and organizationId are required" },
        { status: 400 }
      );
    }

    const repository = new PrismaAiNutritionDiagnosisSuggestionRepository();
    const filters: {
      patientId: string;
      organizationId: string;
      consultationId?: string | null;
    } = {
      patientId,
      organizationId,
    };

    if (consultationId !== null) {
      filters.consultationId = consultationId;
    }

    const suggestions = await repository.listByOrganization(filters);

    return NextResponse.json({
      suggestions: suggestions.map((s) => ({
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

