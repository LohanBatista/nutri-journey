"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/presentation/stores/session-store";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import type { Program } from "@/domain/entities/Program";
import { Calendar, ExternalLink, Users } from "lucide-react";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PLANNED: "Planejado",
    ACTIVE: "Ativo",
    FINISHED: "Finalizado",
  };
  return statusMap[status] || status;
}

function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    PLANNED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    FINISHED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return statusMap[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

interface ProgramWithParticipantInfo extends Program {
  participantInfo?: {
    joinDate: Date;
    notes: string | null;
  } | null;
}

interface PatientProgramsTabProps {
  patientId: string;
}

export function PatientProgramsTab({ patientId }: PatientProgramsTabProps) {
  const router = useRouter();
  const { organization } = useSessionStore();
  const [programs, setPrograms] = useState<ProgramWithParticipantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!organization?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/patients/${patientId}/programs?organizationId=${organization.id}`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar programas");
        }

        const data = await response.json();
        setPrograms(data.programs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [patientId, organization?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400">Carregando programas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-400">Erro: {error}</div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400 mb-2">
          Este paciente não está participando de nenhum programa ou grupo.
        </p>
        <Button
          onClick={() => router.push("/app/programs")}
          className="bg-primary hover:bg-primary/90 text-white mt-4"
        >
          Ver Programas Disponíveis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Programas e Grupos ({programs.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {programs.map((program) => (
          <Card
            key={program.id}
            className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            onClick={() => router.push(`/app/programs/${program.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white mb-2">{program.name}</CardTitle>
                  <p className="text-slate-400 text-sm">{program.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/app/programs/${program.id}`);
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
                      program.status
                    )}`}
                  >
                    {formatStatus(program.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Data de Início</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <p className="text-white">{formatDate(program.startDate)}</p>
                  </div>
                </div>
                {program.participantInfo && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Data de Ingresso</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-white">
                        {formatDate(program.participantInfo.joinDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {program.participantInfo?.notes && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Observações</p>
                  <p className="text-white text-sm">
                    {program.participantInfo.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

