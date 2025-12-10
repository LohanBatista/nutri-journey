"use client";

import { useState } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { NutritionPlan } from "@/domain/entities/NutritionPlan";

interface UpdateNutritionPlanInput {
  title?: string;
  goals?: string;
  notes?: string | null;
  isActive?: boolean;
}

interface UseUpdateNutritionPlanResult {
  updateNutritionPlan: (
    id: string,
    input: UpdateNutritionPlanInput
  ) => Promise<NutritionPlan>;
  loading: boolean;
  error: string | null;
}

export function useUpdateNutritionPlan(): UseUpdateNutritionPlanResult {
  const { organization } = useSessionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateNutritionPlan = async (
    id: string,
    input: UpdateNutritionPlanInput
  ): Promise<NutritionPlan> => {
    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/nutrition-plans/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organization.id,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erro ao atualizar plano nutricional"
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
    updateNutritionPlan,
    loading,
    error,
  };
}

