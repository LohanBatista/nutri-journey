"use client";

import { useState } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { Patient } from "@/domain/entities/Patient";
import type { CreatePatientInput } from "@/application/use-cases/CreatePatient";

interface UseCreatePatientResult {
  createPatient: (input: Omit<CreatePatientInput, "organizationId">) => Promise<Patient>;
  loading: boolean;
  error: string | null;
}

export function useCreatePatient(): UseCreatePatientResult {
  const { organization } = useSessionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createPatient = async (
    input: Omit<CreatePatientInput, "organizationId">
  ): Promise<Patient> => {
    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...input,
          organizationId: organization.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erro ao criar paciente"
        );
      }

      const data: { patient: Patient } = await response.json();
      return data.patient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPatient,
    loading,
    error,
  };
}

