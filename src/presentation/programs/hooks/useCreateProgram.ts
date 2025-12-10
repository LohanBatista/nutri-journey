"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/presentation/stores/session-store";

export function useCreateProgram() {
  const { organization } = useSessionStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProgram = async (data: {
    name: string;
    description: string;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: "PLANNED" | "ACTIVE" | "FINISHED";
    professionalIds?: string[];
  }) => {
    if (!organization?.id) {
      setError("Organização não encontrada");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: organization.id,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar programa");
      }

      const result = await response.json();
      router.push(`/app/programs/${result.program.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProgram, loading, error };
}

