import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreateProgramMeetingUseCase } from "@/application/factories/makeCreateProgramMeetingUseCase";
import { PrismaProgramMeetingRepository } from "@/infra/repositories/PrismaProgramMeetingRepository";

const createMeetingSchema = z.object({
  date: z.string().datetime().or(z.date()),
  topic: z.string().min(1),
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
    const validatedData = createMeetingSchema.parse(body);

    const createMeetingUseCase = makeCreateProgramMeetingUseCase();
    const result = await createMeetingUseCase.execute(organizationId, {
      programId: id,
      date:
        validatedData.date instanceof Date
          ? validatedData.date
          : new Date(validatedData.date),
      topic: validatedData.topic,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetingRepository = new PrismaProgramMeetingRepository();
    const meetings = await meetingRepository.findByProgramId(id);

    return NextResponse.json({ meetings });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

