import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreateProgramUseCase } from "@/application/factories/makeCreateProgramUseCase";
import { makeListProgramsUseCase } from "@/application/factories/makeListProgramsUseCase";

const createProgramSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  startDate: z.string().datetime().or(z.date()).nullable().optional(),
  endDate: z.string().datetime().or(z.date()).nullable().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "FINISHED"]).optional(),
  professionalIds: z.array(z.string().uuid()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProgramSchema.parse(body);

    const createProgramUseCase = makeCreateProgramUseCase();
    
    // Processar startDate
    let processedStartDate: Date | null | undefined = undefined;
    if (validatedData.startDate !== undefined) {
      if (validatedData.startDate instanceof Date) {
        processedStartDate = validatedData.startDate;
      } else if (validatedData.startDate !== null) {
        processedStartDate = new Date(validatedData.startDate);
      } else {
        processedStartDate = null;
      }
    }

    // Processar endDate
    let processedEndDate: Date | null | undefined = undefined;
    if (validatedData.endDate !== undefined) {
      if (validatedData.endDate instanceof Date) {
        processedEndDate = validatedData.endDate;
      } else if (validatedData.endDate !== null) {
        processedEndDate = new Date(validatedData.endDate);
      } else {
        processedEndDate = null;
      }
    }

    const result = await createProgramUseCase.execute({
      organizationId: validatedData.organizationId,
      name: validatedData.name,
      description: validatedData.description,
      ...(processedStartDate !== undefined && { startDate: processedStartDate }),
      ...(processedEndDate !== undefined && { endDate: processedEndDate }),
      ...(validatedData.status !== undefined && { status: validatedData.status }),
      ...(validatedData.professionalIds !== undefined && { professionalIds: validatedData.professionalIds }),
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
      status?: "PLANNED" | "ACTIVE" | "FINISHED";
      search?: string;
    } = {};

    const status = searchParams.get("status");
    if (status && ["PLANNED", "ACTIVE", "FINISHED"].includes(status)) {
      filters.status = status as "PLANNED" | "ACTIVE" | "FINISHED";
    }

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const listProgramsUseCase = makeListProgramsUseCase();
    const hasFilters = Object.keys(filters).length > 0;
    const result = await listProgramsUseCase.execute({
      organizationId,
      ...(hasFilters && { filters }),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

