import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreatePatientUseCase } from "@/application/factories/makeCreatePatientUseCase";
import { makeListPatientsUseCase } from "@/application/factories/makeListPatientsUseCase";

const createPatientSchema = z.object({
  organizationId: z.string().uuid(),
  fullName: z.string().min(1),
  dateOfBirth: z.string().datetime().or(z.date()),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPatientSchema.parse(body);

    const createPatientUseCase = makeCreatePatientUseCase();
    const result = await createPatientUseCase.execute({
      organizationId: validatedData.organizationId,
      fullName: validatedData.fullName,
      dateOfBirth:
        validatedData.dateOfBirth instanceof Date
          ? validatedData.dateOfBirth
          : new Date(validatedData.dateOfBirth),
      sex: validatedData.sex,
      phone: validatedData.phone ?? null,
      email: validatedData.email ?? null,
      tags: validatedData.tags,
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

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const listPatientsSchema = z.object({
  organizationId: z.string().uuid(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sex: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const filters: {
      search?: string;
      tags?: string[];
      sex?: "MALE" | "FEMALE" | "OTHER";
    } = {};

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      filters.tags = tagsParam.split(",");
    }

    const sex = searchParams.get("sex");
    if (sex && ["MALE", "FEMALE", "OTHER"].includes(sex)) {
      filters.sex = sex as "MALE" | "FEMALE" | "OTHER";
    }

    const listPatientsUseCase = makeListPatientsUseCase();
    const result = await listPatientsUseCase.execute({
      organizationId,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

