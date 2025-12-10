import type {
  NutritionPlan,
  NutritionPlanMeal,
  CreateNutritionPlanInput,
  UpdateNutritionPlanInput,
} from "@/domain/entities/NutritionPlan";
import type { NutritionPlanRepository } from "@/domain/repositories/NutritionPlanRepository";
import { prisma } from "../database/prisma";

export class PrismaNutritionPlanRepository implements NutritionPlanRepository {
  async findById(
    id: string,
    organizationId: string
  ): Promise<NutritionPlan | null> {
    const plan = await prisma.nutritionPlan.findFirst({
      where: { id, organizationId },
      include: { meals: true },
    });

    if (!plan) {
      return null;
    }

    return this.toDomain(plan);
  }

  async findActiveByPatient(
    patientId: string,
    organizationId: string
  ): Promise<NutritionPlan | null> {
    const plan = await prisma.nutritionPlan.findFirst({
      where: {
        patientId,
        organizationId,
        isActive: true,
      },
      include: { meals: true },
      orderBy: { createdAt: "desc" },
    });

    if (!plan) {
      return null;
    }

    return this.toDomain(plan);
  }

  async listByPatient(
    patientId: string,
    organizationId: string
  ): Promise<NutritionPlan[]> {
    const plans = await prisma.nutritionPlan.findMany({
      where: {
        patientId,
        organizationId,
      },
      include: { meals: true },
      orderBy: { createdAt: "desc" },
    });

    return plans.map((plan) => this.toDomain(plan));
  }

  async create(data: CreateNutritionPlanInput): Promise<NutritionPlan> {
    const plan = await prisma.nutritionPlan.create({
      data: {
        organizationId: data.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        title: data.title,
        goals: data.goals,
        notes: data.notes ?? null,
        isActive: data.isActive ?? true,
        meals: {
          create:
            data.meals?.map((meal) => ({
              mealType: meal.mealType,
              description: meal.description,
              observation: meal.observation ?? null,
            })) ?? [],
        },
      },
      include: { meals: true },
    });

    return this.toDomain(plan);
  }

  async update(
    id: string,
    data: UpdateNutritionPlanInput
  ): Promise<NutritionPlan> {
    const plan = await prisma.nutritionPlan.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.goals !== undefined && { goals: data.goals }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: { meals: true },
    });

    return this.toDomain(plan);
  }

  async delete(id: string): Promise<void> {
    await prisma.nutritionPlan.delete({
      where: { id },
    });
  }

  private toDomain(plan: {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    title: string;
    goals: string;
    notes: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    meals: {
      id: string;
      nutritionPlanId: string;
      mealType: string;
      description: string;
      observation: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }): NutritionPlan {
    return {
      id: plan.id,
      organizationId: plan.organizationId,
      patientId: plan.patientId,
      professionalId: plan.professionalId,
      title: plan.title,
      goals: plan.goals,
      notes: plan.notes,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      meals: plan.meals.map((meal) => ({
        id: meal.id,
        nutritionPlanId: meal.nutritionPlanId,
        mealType: meal.mealType as
          | "BREAKFAST"
          | "MORNING_SNACK"
          | "LUNCH"
          | "AFTERNOON_SNACK"
          | "DINNER"
          | "SUPPER"
          | "OTHER",
        description: meal.description,
        observation: meal.observation,
        createdAt: meal.createdAt,
        updatedAt: meal.updatedAt,
      })),
    };
  }
}
