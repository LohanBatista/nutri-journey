"use client";

import { useState } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { NutritionPlan } from "@/domain/entities/NutritionPlan";

interface CreateNutritionPlanInput {
  patientId: string;
  title: string;
  goals: string;
  notes?: string | null;
  isActive?: boolean;
  meals?: {
    mealType:
      | "BREAKFAST"
      | "MORNING_SNACK"
      | "LUNCH"
      | "AFTERNOON_SNACK"
      | "DINNER"
      | "SUPPER"
      | "OTHER";
    description: string;
    observation?: string | null;
  }[];
}

interface UseCreateNutritionPlanResult {
  createNutritionPlan: (input: CreateNutritionPlanInput) => Promise<NutritionPlan>;
  loading: boolean;
  error: string | null;
}

export function useCreateNutritionPlan(): UseCreateNutritionPlanResult {
  const { organization, professional } = useSessionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createNutritionPlan = async (
    input: CreateNutritionPlanInput
  ): Promise<NutritionPlan> => {
    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    if (!professional) {
      throw new Error("Profissional não encontrado");
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/nutrition-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          organizationId: organization.id,
          professionalId: professional.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erro ao criar plano nutricional"
        );
      }

      const data: { nutritionPlan: NutritionPlan } = await response.json();
      return data.nutritionPlan;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createNutritionPlan,
    loading,
    error,
  };
}

