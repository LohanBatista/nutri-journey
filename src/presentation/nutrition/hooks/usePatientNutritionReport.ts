"use client";

import { useState } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { GeneratePatientNutritionReportOutput } from "@/application/use-cases/GeneratePatientNutritionReport";

interface UsePatientNutritionReportResult {
  generateReport: () => Promise<GeneratePatientNutritionReportOutput>;
  loading: boolean;
  error: string | null;
}

export function usePatientNutritionReport(
  patientId: string
): UsePatientNutritionReportResult {
  const { organization } = useSessionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport =
    async (): Promise<GeneratePatientNutritionReportOutput> => {
      if (!patientId) {
        throw new Error("ID do paciente não fornecido");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/patients/${patientId}/nutrition-report`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Erro ao gerar relatório");
        }

        const data: GeneratePatientNutritionReportOutput =
          await response.json();
        return data;
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
    generateReport,
    loading,
    error,
  };
}

