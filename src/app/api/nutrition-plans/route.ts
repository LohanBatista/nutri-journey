import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { makeCreateNutritionPlanUseCase } from "@/application/factories/makeCreateNutritionPlanUseCase";
import { makeListNutritionPlansUseCase } from "@/application/factories/makeListNutritionPlansUseCase";

const mealTypeEnum = z.enum([
  "BREAKFAST",
  "MORNING_SNACK",
  "LUNCH",
  "AFTERNOON_SNACK",
  "DINNER",
  "SUPPER",
  "OTHER",
]);

const createNutritionPlanSchema = z.object({
  organizationId: z.string().uuid(),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  title: z.string().min(1),
  goals: z.string().min(1),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  meals: z
    .array(
      z.object({
        mealType: mealTypeEnum,
        description: z.string().min(1),
        observation: z.string().nullable().optional(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createNutritionPlanSchema.parse(body);

    const createNutritionPlanUseCase = makeCreateNutritionPlanUseCase();
    const result = await createNutritionPlanUseCase.execute({
      organizationId: validatedData.organizationId,
      patientId: validatedData.patientId,
      professionalId: validatedData.professionalId,
      title: validatedData.title,
      goals: validatedData.goals,
      ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
      ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      ...(validatedData.meals !== undefined && {
        meals: validatedData.meals.map((meal) => ({
          mealType: meal.mealType,
          description: meal.description,
          ...(meal.observation !== undefined && { observation: meal.observation }),
        })),
      }),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const organizationId = searchParams.get("organizationId");

    if (!patientId || !organizationId) {
      return NextResponse.json(
        { error: "patientId and organizationId are required" },
        { status: 400 }
      );
    }

    const listNutritionPlansUseCase = makeListNutritionPlansUseCase();
    const result = await listNutritionPlansUseCase.execute({
      patientId,
      organizationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
