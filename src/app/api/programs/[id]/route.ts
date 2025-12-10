import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeGetProgramUseCase } from "@/application/factories/makeGetProgramUseCase";
import { makeUpdateProgramUseCase } from "@/application/factories/makeUpdateProgramUseCase";

const updateProgramSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  startDate: z.string().datetime().or(z.date()).nullable().optional(),
  endDate: z.string().datetime().or(z.date()).nullable().optional(),
  status: z.enum(["PLANNED", "ACTIVE", "FINISHED"]).optional(),
});

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

    const getProgramUseCase = makeGetProgramUseCase();
    const result = await getProgramUseCase.execute({
      id,
      organizationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const validatedData = updateProgramSchema.parse(body);

    const updateProgramUseCase = makeUpdateProgramUseCase();
    
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

    const result = await updateProgramUseCase.execute(id, organizationId, {
      ...(validatedData.name !== undefined && { name: validatedData.name }),
      ...(validatedData.description !== undefined && {
        description: validatedData.description,
      }),
      ...(processedStartDate !== undefined && { startDate: processedStartDate }),
      ...(processedEndDate !== undefined && { endDate: processedEndDate }),
      ...(validatedData.status !== undefined && { status: validatedData.status }),
    });

    return NextResponse.json(result);
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

