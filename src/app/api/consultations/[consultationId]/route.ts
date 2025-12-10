import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeUpdateConsultationUseCase } from "@/application/factories/makeUpdateConsultationUseCase";

const updateConsultationSchema = z.object({
  dateTime: z.string().datetime().or(z.date()).optional(),
  type: z.enum(["INITIAL", "FOLLOW_UP", "GROUP", "HOSPITAL"]).optional(),
  mainComplaint: z.string().nullable().optional(),
  nutritionHistory: z.string().nullable().optional(),
  clinicalHistory: z.string().nullable().optional(),
  objectiveData: z.string().nullable().optional(),
  nutritionDiagnosis: z.string().nullable().optional(),
  plan: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ consultationId: string }> }
) {
  try {
    const { consultationId } = await params;
    const session = await auth();
    const body = await request.json();
    const validatedData = updateConsultationSchema.parse(body);

    // Tentar obter organizationId da sessão ou do body
    const organizationId = session?.organization?.id || body.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const updateConsultationUseCase = makeUpdateConsultationUseCase();
    const updateInput: {
      id: string;
      organizationId: string;
      dateTime?: Date;
      type?: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
      mainComplaint?: string | null;
      nutritionHistory?: string | null;
      clinicalHistory?: string | null;
      objectiveData?: string | null;
      nutritionDiagnosis?: string | null;
      plan?: string | null;
    } = {
      id: consultationId,
      organizationId,
    };

    if (validatedData.dateTime !== undefined) {
      updateInput.dateTime =
        validatedData.dateTime instanceof Date
          ? validatedData.dateTime
          : new Date(validatedData.dateTime);
    }
    if (validatedData.type !== undefined) {
      updateInput.type = validatedData.type;
    }
    if (validatedData.mainComplaint !== undefined) {
      updateInput.mainComplaint = validatedData.mainComplaint;
    }
    if (validatedData.nutritionHistory !== undefined) {
      updateInput.nutritionHistory = validatedData.nutritionHistory;
    }
    if (validatedData.clinicalHistory !== undefined) {
      updateInput.clinicalHistory = validatedData.clinicalHistory;
    }
    if (validatedData.objectiveData !== undefined) {
      updateInput.objectiveData = validatedData.objectiveData;
    }
    if (validatedData.nutritionDiagnosis !== undefined) {
      updateInput.nutritionDiagnosis = validatedData.nutritionDiagnosis;
    }
    if (validatedData.plan !== undefined) {
      updateInput.plan = validatedData.plan;
    }

    const result = await updateConsultationUseCase.execute(updateInput);

    return NextResponse.json({
      consultation: {
        ...result.consultation,
        dateTime: result.consultation.dateTime.toISOString(),
        createdAt: result.consultation.createdAt.toISOString(),
        updatedAt: result.consultation.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Consultation not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

