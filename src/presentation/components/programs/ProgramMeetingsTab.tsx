"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useSessionStore } from "@/presentation/stores/session-store";
import { Plus } from "lucide-react";
import type { ProgramMeeting } from "@/domain/entities/Program";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ProgramMeetingsTabProps {
  programId: string;
  onUpdate: () => void;
}

export function ProgramMeetingsTab({
  programId,
  onUpdate,
}: ProgramMeetingsTabProps) {
  const router = useRouter();
  const { organization } = useSessionStore();
  const [meetings, setMeetings] = useState<ProgramMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!organization?.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/programs/${programId}/meetings`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar encontros");
        }

        const data = await response.json();
        setMeetings(data.meetings || []);
      } catch (error) {
        console.error("Erro ao carregar encontros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [programId, organization?.id, onUpdate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CardTitle className="text-white">Encontros do Programa</CardTitle>
        <Button
          onClick={() => router.push(`/app/programs/${programId}/meetings/new`)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Encontro
        </Button>
      </div>

      <Card className="bg-white/5 backdrop-blur-md border border-white/10">
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">
              Carregando encontros...
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum encontro registrado ainda.
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white">Data</TableHead>
                    <TableHead className="text-white">Tópico</TableHead>
                    <TableHead className="text-white">Registros</TableHead>
                    <TableHead className="text-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting, index) => (
                    <motion.tr
                      key={meeting.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="text-white font-medium">
                        {formatDateTime(meeting.date)}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {meeting.topic}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {meeting.records?.length || 0} registros
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/app/programs/${programId}/meetings/${meeting.id}`
                            )
                          }
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          Ver/Editar
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

