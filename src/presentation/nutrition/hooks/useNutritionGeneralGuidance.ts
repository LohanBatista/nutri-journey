"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { NutritionGeneralGuidance } from "@/domain/entities/NutritionGeneralGuidance";

interface UseNutritionGeneralGuidanceResult {
  latestGuidance: NutritionGeneralGuidance | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNutritionGeneralGuidance(
  patientId: string
): UseNutritionGeneralGuidanceResult {
  const { organization } = useSessionStore();
  const [latestGuidance, setLatestGuidance] =
    useState<NutritionGeneralGuidance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestGuidance = async (): Promise<void> => {
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
        `/api/nutrition-general-guidance?patientId=${patientId}&organizationId=${organization.id}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar condutas gerais");
      }

      const data: { guidance: NutritionGeneralGuidance | null } =
        await response.json();
      setLatestGuidance(data.guidance || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setLatestGuidance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLatestGuidance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, patientId]);

  return {
    latestGuidance,
    loading,
    error,
    refetch: fetchLatestGuidance,
  };
}
