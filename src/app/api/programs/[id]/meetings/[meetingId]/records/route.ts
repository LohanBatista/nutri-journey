import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeRecordProgramMeetingUseCase } from "@/application/factories/makeRecordProgramMeetingUseCase";
import { PrismaProgramMeetingRecordRepository } from "@/infra/repositories/PrismaProgramMeetingRecordRepository";

const recordMeetingSchema = z.object({
  patientId: z.string().uuid(),
  presence: z.boolean(),
  weightKg: z.number().nullable().optional(),
  bmi: z.number().nullable().optional(),
  bloodPressureSystolic: z.number().nullable().optional(),
  bloodPressureDiastolic: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const body = await request.json();
    const validatedData = recordMeetingSchema.parse(body);

    const recordMeetingUseCase = makeRecordProgramMeetingUseCase();
    const result = await recordMeetingUseCase.execute({
      programMeetingId: meetingId,
      patientId: validatedData.patientId,
      presence: validatedData.presence,
      weightKg: validatedData.weightKg ?? null,
      bmi: validatedData.bmi ?? null,
      bloodPressureSystolic: validatedData.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: validatedData.bloodPressureDiastolic ?? null,
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
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const recordRepository = new PrismaProgramMeetingRecordRepository();
    const records = await recordRepository.findByMeetingId(meetingId);

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

