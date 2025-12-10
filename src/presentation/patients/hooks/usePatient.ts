"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "../../stores/session-store";
import type { Patient } from "@/domain/entities/Patient";

interface UsePatientResult {
  patient: Patient | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePatient(patientId: string): UsePatientResult {
  const { organization } = useSessionStore();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = async (): Promise<void> => {
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

      const response = await fetch(`/api/patients/${patientId}?organizationId=${organization.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Paciente não encontrado");
        }
        throw new Error("Erro ao buscar paciente");
      }

      const data: { patient: Patient } = await response.json();
      setPatient(data.patient);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id, patientId]);

  return {
    patient,
    loading,
    error,
    refetch: fetchPatient,
  };
}

