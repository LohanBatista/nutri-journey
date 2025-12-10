"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/presentation/stores/session-store";

export type ConsultationsPeriod = "7days" | "30days" | "3months" | "6months";

export interface DashboardStats {
  totalPatients: number;
  consultationsThisMonth: number;
  activePrograms: number;
  consultationsByPeriod: Array<{ label: string; count: number }>;
  sexDistribution: Array<{ name: string; value: number }>;
  programStatus: Array<{ name: string; value: number }>;
}

export function useDashboardStats(consultationsPeriod: ConsultationsPeriod = "6months") {
  const { organization } = useSessionStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    consultationsThisMonth: 0,
    activePrograms: 0,
    consultationsByPeriod: [],
    sexDistribution: [],
    programStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/dashboard/stats?organizationId=${organization.id}&consultationsPeriod=${consultationsPeriod}`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar estatísticas");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organization?.id, consultationsPeriod]);

  return { stats, loading, error };
}

