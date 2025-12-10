"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { Program } from "@/domain/entities/Program";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatStatus(status: string): string {
  const statusMap: Record<string, { label: string; color: string }> = {
    PLANNED: { label: "Planejado", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    ACTIVE: { label: "Ativo", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    FINISHED: { label: "Finalizado", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  };
  return statusMap[status]?.label || status;
}

function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    PLANNED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    FINISHED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return statusMap[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

interface ProgramSummaryTabProps {
  program: Program;
}

export function ProgramSummaryTab({ program }: ProgramSummaryTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Descrição</p>
            <p className="text-white">{program.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Status</p>
              <span
                className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(program.status)}`}
              >
                {formatStatus(program.status)}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Data de Início</p>
              <p className="text-white">{formatDate(program.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Data de Término</p>
              <p className="text-white">{formatDate(program.endDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {program.participants?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Encontros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {program.meetings?.length || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Profissionais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {program.professionals?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

