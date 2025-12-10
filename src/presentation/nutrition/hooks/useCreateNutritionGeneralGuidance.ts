"use client";

import { useState } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { NutritionGeneralGuidance } from "@/domain/entities/NutritionGeneralGuidance";

interface CreateNutritionGeneralGuidanceInput {
  patientId: string;
  date: Date;
  hydrationGuidance?: string | null;
  physicalActivityGuidance?: string | null;
  sleepGuidance?: string | null;
  symptomManagementGuidance?: string | null;
  notes?: string | null;
}

interface UseCreateNutritionGeneralGuidanceResult {
  createNutritionGeneralGuidance: (
    input: CreateNutritionGeneralGuidanceInput
  ) => Promise<NutritionGeneralGuidance>;
  loading: boolean;
  error: string | null;
}

export function useCreateNutritionGeneralGuidance(): UseCreateNutritionGeneralGuidanceResult {
  const { organization, professional } = useSessionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createNutritionGeneralGuidance = async (
    input: CreateNutritionGeneralGuidanceInput
  ): Promise<NutritionGeneralGuidance> => {
    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    if (!professional) {
      throw new Error("Profissional não encontrado");
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/nutrition-general-guidance", {
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
        throw new Error(errorData.error || "Erro ao criar conduta geral");
      }

      const data: { nutritionGeneralGuidance: NutritionGeneralGuidance } =
        await response.json();
      return data.nutritionGeneralGuidance;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createNutritionGeneralGuidance,
    loading,
    error,
  };
}
