import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeUpdatePatientUseCase } from "@/application/factories/makeUpdatePatientUseCase";
import { makeGetPatientUseCase } from "@/application/factories/makeGetPatientUseCase";

const updatePatientSchema = z.object({
  fullName: z.string().min(1).optional(),
  dateOfBirth: z.string().datetime().or(z.date()).optional(),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const body = await request.json();
    const validatedData = updatePatientSchema.parse(body);

    const organizationId = request.headers.get("x-organization-id");
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId header is required" },
        { status: 400 }
      );
    }

    const updatePatientUseCase = makeUpdatePatientUseCase();
    const updateInput: {
      id: string;
      organizationId: string;
      fullName?: string;
      dateOfBirth?: Date;
      sex?: "MALE" | "FEMALE" | "OTHER";
      phone?: string | null;
      email?: string | null;
      tags?: string[];
      notes?: string | null;
    } = {
      id: patientId,
      organizationId,
    };

    if (validatedData.fullName !== undefined) {
      updateInput.fullName = validatedData.fullName;
    }
    if (validatedData.dateOfBirth !== undefined) {
      updateInput.dateOfBirth = validatedData.dateOfBirth instanceof Date
        ? validatedData.dateOfBirth
        : new Date(validatedData.dateOfBirth);
    }
    if (validatedData.sex !== undefined) {
      updateInput.sex = validatedData.sex;
    }
    if (validatedData.phone !== undefined) {
      updateInput.phone = validatedData.phone;
    }
    if (validatedData.email !== undefined) {
      updateInput.email = validatedData.email;
    }
    if (validatedData.tags !== undefined) {
      updateInput.tags = validatedData.tags;
    }
    if (validatedData.notes !== undefined) {
      updateInput.notes = validatedData.notes;
    }

    const result = await updatePatientUseCase.execute(updateInput);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Patient not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const getPatientUseCase = makeGetPatientUseCase();
    const result = await getPatientUseCase.execute({
      id: patientId,
      organizationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Patient not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

