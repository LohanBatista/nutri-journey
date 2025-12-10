"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/ui/tabs";
import { usePatient } from "@/presentation/patients/hooks/usePatient";
import { PlansAndGuidanceTab } from "@/presentation/components/nutrition/PlansAndGuidanceTab";
import { PatientProgramsTab } from "@/presentation/components/patients/PatientProgramsTab";
import { ArrowLeft, Calendar, Mail, Phone, Tag } from "lucide-react";

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

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

function formatSex(sex: string): string {
  const sexMap: Record<string, string> = {
    MALE: "Masculino",
    FEMALE: "Feminino",
    OTHER: "Outro",
  };
  return sexMap[sex] || sex;
}

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const router = useRouter();
  const { patientId } = use(params);
  const { patient, loading, error } = usePatient(patientId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Carregando paciente...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-400">Erro: {error || "Paciente não encontrado"}</div>
        <Button
          variant="ghost"
          onClick={() => router.push("/app/patients")}
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
          <h1 className="text-3xl font-bold text-white">{patient.fullName}</h1>
          <p className="text-slate-400 mt-1">
            {calculateAge(patient.dateOfBirth)} anos • {formatSex(patient.sex)}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Informações do Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Data de Nascimento</p>
                    <p className="text-white">{formatDate(patient.dateOfBirth)}</p>
                  </div>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Telefone</p>
                      <p className="text-white">{patient.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="text-white">{patient.email}</p>
                    </div>
                  </div>
                )}
                {patient.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {patient.notes && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-2">Observações</p>
                <p className="text-white whitespace-pre-wrap">{patient.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardContent className="pt-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 mb-6">
                <TabsTrigger
                  value="summary"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
                >
                  Resumo
                </TabsTrigger>
                <TabsTrigger
                  value="consultations"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
                >
                  Consultas
                </TabsTrigger>
                <TabsTrigger
                  value="anthropometry"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
                >
                  Antropometria
                </TabsTrigger>
                <TabsTrigger
                  value="lab-results"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
                >
                  Exames
                </TabsTrigger>
                <TabsTrigger
                  value="plans"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
                >
                  Planos/Condutas
                </TabsTrigger>
                <TabsTrigger
                  value="programs"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
                >
                  Programas/Grupos
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
                >
                  Insights de IA
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="text-slate-400">
                  <p className="mb-4">Últimos registros do paciente:</p>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-sm text-slate-400 mb-2">Última Antropometria</p>
                      <p className="text-white">Nenhum registro encontrado</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-sm text-slate-400 mb-2">Últimos Exames</p>
                      <p className="text-white">Nenhum exame encontrado</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-sm text-slate-400 mb-2">Últimas Consultas</p>
                      <p className="text-white">Nenhuma consulta encontrada</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="consultations" className="space-y-4">
                <div className="text-slate-400">
                  <p>Lista de consultas será implementada em breve.</p>
                </div>
              </TabsContent>

              <TabsContent value="anthropometry" className="space-y-4">
                <div className="text-slate-400">
                  <p>Registros de antropometria serão implementados em breve.</p>
                </div>
              </TabsContent>

              <TabsContent value="lab-results" className="space-y-4">
                <div className="text-slate-400">
                  <p>Resultados de exames serão implementados em breve.</p>
                </div>
              </TabsContent>

              <TabsContent value="plans" className="space-y-4">
                <PlansAndGuidanceTab patientId={patientId} />
              </TabsContent>

              <TabsContent value="programs" className="space-y-4">
                <PatientProgramsTab patientId={patientId} />
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="text-slate-400">
                  <p>Insights de IA serão implementados nas Fases 4/5.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

