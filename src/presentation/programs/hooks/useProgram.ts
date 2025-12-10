"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/presentation/stores/session-store";
import type { Program } from "@/domain/entities/Program";

export function useProgram(programId: string) {
  const { organization } = useSessionStore();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization?.id || !programId) {
      setLoading(false);
      return;
    }

    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/programs/${programId}?organizationId=${organization.id}`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar programa");
        }

        const data = await response.json();
        setProgram(data.program);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [organization?.id, programId]);

  const refetch = async () => {
    if (!organization?.id || !programId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/programs/${programId}?organizationId=${organization.id}`
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar programa");
      }

      const data = await response.json();
      setProgram(data.program);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return { program, loading, error, refetch };
}

