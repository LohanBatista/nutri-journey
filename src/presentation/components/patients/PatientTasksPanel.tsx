"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { useTasks } from "@/presentation/tasks/hooks";
import { CheckCircle2, Circle, Clock, Calendar } from "lucide-react";
import type { TaskStatus } from "@/domain/entities/Task";

interface PatientTasksPanelProps {
  patientId: string;
}

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

export function PatientTasksPanel({ patientId }: PatientTasksPanelProps) {
  const { tasks, loading, error, refetch } = useTasks({
    patientId,
  });

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

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-slate-400">Carregando tarefas...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-400">Erro: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Tarefas Relacionadas</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            Nenhuma tarefa encontrada para este paciente.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium text-sm flex-1">{task.title}</h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {getStatusIcon(task.status)}
                  </span>
                </div>

                {task.description && (
                  <p className="text-slate-300 text-xs mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {task.dueDate && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(task.dueDate)}
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  {task.status !== "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(task.id, "PENDING")}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                    >
                      Pendente
                    </Button>
                  )}
                  {task.status !== "IN_PROGRESS" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                    >
                      Em Progresso
                    </Button>
                  )}
                  {task.status !== "DONE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(task.id, "DONE")}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs h-7"
                    >
                      Concluir
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

