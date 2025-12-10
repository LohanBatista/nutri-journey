"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/ui/tabs";
import { useProgram } from "@/presentation/programs/hooks";
import { ArrowLeft } from "lucide-react";
import { ProgramSummaryTab } from "@/presentation/components/programs/ProgramSummaryTab";
import { ProgramParticipantsTab } from "@/presentation/components/programs/ProgramParticipantsTab";
import { ProgramMeetingsTab } from "@/presentation/components/programs/ProgramMeetingsTab";
import { ProgramAiTab } from "@/presentation/components/programs/ProgramAiTab";

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

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const router = useRouter();
  const { programId } = use(params);
  const { program, loading, error, refetch } = useProgram(programId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Carregando programa...</div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-400">Erro: {error || "Programa não encontrado"}</div>
        <Button
          variant="ghost"
          onClick={() => router.push("/app/programs")}
          className="text-slate-400 hover:text-white hover:bg-white/10"
        >
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <h1 className="text-3xl font-bold text-white">{program.name}</h1>
          <p className="text-slate-400 mt-1">
            {formatStatus(program.status)} • {formatDate(program.startDate)} - {formatDate(program.endDate)}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 mb-6">
                <TabsTrigger
                  value="summary"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-300"
                >
                  Resumo
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-300"
                >
                  Participantes
                </TabsTrigger>
                <TabsTrigger
                  value="meetings"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-300"
                >
                  Encontros
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-300"
                >
                  IA
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-0">
                <ProgramSummaryTab program={program} />
              </TabsContent>

              <TabsContent value="participants" className="mt-0">
                <ProgramParticipantsTab programId={programId} onUpdate={refetch} />
              </TabsContent>

              <TabsContent value="meetings" className="mt-0">
                <ProgramMeetingsTab programId={programId} onUpdate={refetch} />
              </TabsContent>

              <TabsContent value="ai" className="mt-0">
                <ProgramAiTab
                  programId={programId}
                  meetings={(program.meetings || []).map((m) => ({
                    id: m.id,
                    date: typeof m.date === 'string' ? m.date : m.date.toISOString(),
                    topic: m.topic,
                  }))}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

