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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const result = await updatePatientUseCase.execute({
      id,
      organizationId,
      fullName: validatedData.fullName,
      dateOfBirth: validatedData.dateOfBirth
        ? validatedData.dateOfBirth instanceof Date
          ? validatedData.dateOfBirth
          : new Date(validatedData.dateOfBirth)
        : undefined,
      sex: validatedData.sex,
      phone: validatedData.phone,
      email: validatedData.email,
      tags: validatedData.tags,
      notes: validatedData.notes,
    });

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      id,
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

