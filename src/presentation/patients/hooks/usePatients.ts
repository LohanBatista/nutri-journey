"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { Patient } from "@/domain/entities/Patient";
import type { PatientListFilters } from "@/domain/entities/Patient";

interface UsePatientsResult {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePatients(filters?: PatientListFilters): UsePatientsResult {
  const { organization } = useSessionStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async (): Promise<void> => {
    if (!organization) {
      setError("Organização não encontrada");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        organizationId: organization.id,
      });

      if (filters?.search) {
        params.append("search", filters.search);
      }

      if (filters?.tags && filters.tags.length > 0) {
        params.append("tags", filters.tags.join(","));
      }

      if (filters?.sex) {
        params.append("sex", filters.sex);
      }

      const response = await fetch(`/api/patients?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar pacientes");
      }

      const data: { patients: Patient[] } = await response.json();
      setPatients(data.patients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, filters?.search, filters?.tags?.join(","), filters?.sex]);

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients,
  };
}

