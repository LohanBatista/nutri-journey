"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { useTasks } from "@/presentation/tasks/hooks";
import { useSessionStore } from "@/presentation/stores/session-store";
import { Plus, CheckCircle2, Circle, Clock, Calendar } from "lucide-react";
import type { TaskStatus } from "@/domain/entities/Task";
import { CreateTaskModal } from "@/presentation/components/tasks/CreateTaskModal";

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Sem data";
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("pt-BR");
}

function getStatusColor(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    DONE: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  return statusMap[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

function getStatusLabel(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    PENDING: "Pendente",
    IN_PROGRESS: "Em Progresso",
    DONE: "Concluída",
  };
  return statusMap[status] || status;
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case "PENDING":
      return <Circle className="w-4 h-4" />;
    case "IN_PROGRESS":
      return <Clock className="w-4 h-4" />;
    case "DONE":
      return <CheckCircle2 className="w-4 h-4" />;
  }
}

export default function TasksPage() {
  const { professional, organization } = useSessionStore();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [patientIdFilter, setPatientIdFilter] = useState<string | undefined>(undefined);
  const [programIdFilter, setProgramIdFilter] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { tasks, loading, error, refetch } = useTasks(
    (() => {
      const filters: {
        status?: TaskStatus;
        patientId?: string;
        programId?: string;
        professionalId?: string;
      } = {};
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (patientIdFilter) {
        filters.patientId = patientIdFilter;
      }
      
      if (programIdFilter) {
        filters.programId = programIdFilter;
      }
      
      if (professional?.id) {
        filters.professionalId = professional.id;
      }
      
      return filters;
    })()
  );

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }

      await refetch();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    dueDate?: string;
    patientId?: string | null;
    programId?: string;
  }) => {
    if (!professional || !organization) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          professionalId: professional.id,
          title: data.title,
          description: data.description || null,
          dueDate: data.dueDate || null,
          patientId: data.patientId || null,
          programId: data.programId || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar tarefa");
      }

      setShowCreateModal(false);
      await refetch();
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Tarefas
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Lista de Tarefas</CardTitle>
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(undefined)}
                  className={
                    statusFilter === undefined
                      ? "bg-primary text-white"
                      : "bg-white/5 border-white/10 text-white"
                  }
                >
                  Todas
                </Button>
                <Button
                  variant={statusFilter === "PENDING" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("PENDING")}
                  className={
                    statusFilter === "PENDING"
                      ? "bg-primary text-white"
                      : "bg-white/5 border-white/10 text-white"
                  }
                >
                  Pendentes
                </Button>
                <Button
                  variant={statusFilter === "IN_PROGRESS" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("IN_PROGRESS")}
                  className={
                    statusFilter === "IN_PROGRESS"
                      ? "bg-primary text-white"
                      : "bg-white/5 border-white/10 text-white"
                  }
                >
                  Em Progresso
                </Button>
                <Button
                  variant={statusFilter === "DONE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("DONE")}
                  className={
                    statusFilter === "DONE"
                      ? "bg-primary text-white"
                      : "bg-white/5 border-white/10 text-white"
                  }
                >
                  Concluídas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8 text-slate-400">
                Carregando tarefas...
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-400">
                Erro: {error}
              </div>
            )}

            {!loading && !error && tasks.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                Nenhuma tarefa encontrada.
              </div>
            )}

            {!loading && !error && tasks.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-semibold text-lg flex-1">
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusIcon(task.status)}
                        {getStatusLabel(task.status)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                        <Calendar className="w-4 h-4" />
                        {formatDate(task.dueDate)}
                      </div>
                    )}

                    {task.status !== "DONE" && (
                      <div className="flex gap-2 mt-4">
                        {task.status !== "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(task.id, "PENDING")}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          >
                            Pendente
                          </Button>
                        )}
                        {task.status !== "IN_PROGRESS" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          >
                            Em Progresso
                          </Button>
                        )}
                        {task.status !== "DONE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(task.id, "DONE")}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                          >
                            Concluir
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}

