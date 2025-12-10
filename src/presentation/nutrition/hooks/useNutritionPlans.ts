"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { NutritionPlan } from "@/domain/entities/NutritionPlan";

interface UseNutritionPlansResult {
  nutritionPlans: NutritionPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNutritionPlans(patientId: string): UseNutritionPlansResult {
  const { organization } = useSessionStore();
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNutritionPlans = async (): Promise<void> => {
    if (!organization) {
      setError("Organização não encontrada");
      setLoading(false);
      return;
    }

    if (!patientId) {
      setError("ID do paciente não fornecido");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/nutrition-plans?patientId=${patientId}&organizationId=${organization.id}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar planos nutricionais");
      }

      const data: { nutritionPlans: NutritionPlan[] } = await response.json();
      setNutritionPlans(data.nutritionPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setNutritionPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNutritionPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, patientId]);

  return {
    nutritionPlans,
    loading,
    error,
    refetch: fetchNutritionPlans,
  };
}
