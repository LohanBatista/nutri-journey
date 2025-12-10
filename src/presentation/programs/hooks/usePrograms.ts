"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/presentation/stores/session-store";
import type { Program, ProgramListFilters } from "@/domain/entities/Program";

export function usePrograms(filters?: ProgramListFilters) {
  const { organization } = useSessionStore();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          organizationId: organization.id,
        });

        if (filters?.status) {
          params.append("status", filters.status);
        }

        if (filters?.search) {
          params.append("search", filters.search);
        }

        const response = await fetch(`/api/programs?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erro ao carregar programas");
        }

        const data = await response.json();
        setPrograms(data.programs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [organization?.id, filters?.status, filters?.search]);

  return { programs, loading, error, refetch: () => {} };
}

