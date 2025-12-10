"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/presentation/stores/session-store";
import type { Task, TaskListFilters } from "@/domain/entities/Task";

export function useTasks(filters?: TaskListFilters) {
  const { organization, professional } = useSessionStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (filters?.status) {
          params.append("status", filters.status);
        }

        if (filters?.patientId) {
          params.append("patientId", filters.patientId);
        }

        if (filters?.programId) {
          params.append("programId", filters.programId);
        }

        if (filters?.professionalId) {
          params.append("professionalId", filters.professionalId);
        } else if (professional?.id) {
          params.append("professionalId", professional.id);
        }

        const response = await fetch(`/api/tasks?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Erro ao carregar tarefas");
        }

        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [
    organization?.id,
    professional?.id,
    filters?.status,
    filters?.patientId,
    filters?.programId,
    filters?.professionalId,
  ]);

  const refetch = async () => {
    if (!organization?.id) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filters?.status) {
        params.append("status", filters.status);
      }

      if (filters?.patientId) {
        params.append("patientId", filters.patientId);
      }

      if (filters?.programId) {
        params.append("programId", filters.programId);
      }

      if (filters?.professionalId) {
        params.append("professionalId", filters.professionalId);
      } else if (professional?.id) {
        params.append("professionalId", professional.id);
      }

      const response = await fetch(`/api/tasks?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erro ao carregar tarefas");
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, error, refetch };
}

