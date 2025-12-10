import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeAddParticipantToProgramUseCase } from "@/application/factories/makeAddParticipantToProgramUseCase";
import { makeRemoveParticipantFromProgramUseCase } from "@/application/factories/makeRemoveParticipantFromProgramUseCase";

const addParticipantSchema = z.object({
  patientId: z.string().uuid(),
  notes: z.string().nullable().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = addParticipantSchema.parse(body);

    const addParticipantUseCase = makeAddParticipantToProgramUseCase();
    const result = await addParticipantUseCase.execute(organizationId, {
      programId: id,
      patientId: validatedData.patientId,
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

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const removeParticipantSchema = z.object({
  patientId: z.string().uuid(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const patientId = searchParams.get("patientId");

    if (!organizationId || !patientId) {
      return NextResponse.json(
        { error: "organizationId and patientId are required" },
        { status: 400 }
      );
    }

    const removeParticipantUseCase = makeRemoveParticipantFromProgramUseCase();
    const result = await removeParticipantUseCase.execute(organizationId, {
      programId: id,
      patientId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

