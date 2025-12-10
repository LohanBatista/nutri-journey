import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeGenerateEducationMaterialUseCase } from "@/application/factories/makeGenerateEducationMaterialUseCase";
import { PrismaAiEducationMaterialRepository } from "@/infra/repositories/PrismaAiEducationMaterialRepository";

const generateEducationMaterialSchema = z.object({
  organizationId: z.string().uuid(),
  topic: z.string().min(1),
  context: z.enum(["INDIVIDUAL", "GROUP"]),
  patientId: z.string().uuid().nullable().optional(),
  programId: z.string().uuid().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = generateEducationMaterialSchema.parse(body);

    const generateMaterialUseCase = makeGenerateEducationMaterialUseCase();
    const result = await generateMaterialUseCase.execute({
      organizationId: validatedData.organizationId,
      topic: validatedData.topic,
      context: validatedData.context,
      patientId: validatedData.patientId ?? null,
      programId: validatedData.programId ?? null,
    });

    return NextResponse.json({
      material: {
        ...result.material,
        createdAt: result.material.createdAt.toISOString(),
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
    const organizationId = searchParams.get("organizationId");
    const patientId = searchParams.get("patientId");
    const programId = searchParams.get("programId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const repository = new PrismaAiEducationMaterialRepository();
    const filters: {
      organizationId: string;
      patientId?: string | null;
      programId?: string | null;
    } = {
      organizationId,
    };

    if (patientId) {
      filters.patientId = patientId;
    }

    if (programId) {
      filters.programId = programId;
    }

    const materials = await repository.listByOrganization(filters);

    return NextResponse.json({
      materials: materials.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

