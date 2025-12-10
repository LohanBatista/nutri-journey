"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { useDashboardStats, type ConsultationsPeriod } from "@/presentation/dashboard/hooks/useDashboardStats";
import { ConsultationsChart } from "@/presentation/components/dashboard/ConsultationsChart";
import { SexDistributionChart } from "@/presentation/components/dashboard/SexDistributionChart";
import { ProgramStatusChart } from "@/presentation/components/dashboard/ProgramStatusChart";

export default function DashboardPage() {
  const [consultationsPeriod, setConsultationsPeriod] = useState<ConsultationsPeriod>("6months");
  const { stats, loading, error } = useDashboardStats(consultationsPeriod);

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-white"
      >
        Dashboard
      </motion.h1>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Pacientes</CardTitle>
              <CardDescription className="text-slate-400">Total de pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-slate-400">Carregando...</div>
              ) : error ? (
                <div className="text-red-400">Erro</div>
              ) : (
                <p className="text-3xl font-bold text-white">{stats.totalPatients}</p>
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
            <CardHeader>
              <CardTitle className="text-white">Consultas</CardTitle>
              <CardDescription className="text-slate-400">Consultas este mês</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-slate-400">Carregando...</div>
              ) : error ? (
                <div className="text-red-400">Erro</div>
              ) : (
                <p className="text-3xl font-bold text-white">{stats.consultationsThisMonth}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Programas</CardTitle>
              <CardDescription className="text-slate-400">Programas ativos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-slate-400">Carregando...</div>
              ) : error ? (
                <div className="text-red-400">Erro</div>
              ) : (
                <p className="text-3xl font-bold text-white">{stats.activePrograms}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Consultas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Consultas</CardTitle>
              <CardDescription className="text-slate-400">
                Evolução do número de consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-400">Carregando...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">Erro ao carregar dados</div>
              ) : (
                <ConsultationsChart
                  data={stats.consultationsByPeriod}
                  period={consultationsPeriod}
                  onPeriodChange={setConsultationsPeriod}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Distribuição por Sexo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Distribuição de Pacientes</CardTitle>
              <CardDescription className="text-slate-400">
                Por sexo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-400">Carregando...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">Erro ao carregar dados</div>
              ) : stats.sexDistribution.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Nenhum dado disponível</div>
              ) : (
                <SexDistributionChart data={stats.sexDistribution} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de Status dos Programas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Status dos Programas</CardTitle>
              <CardDescription className="text-slate-400">
                Distribuição por status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-400">Carregando...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">Erro ao carregar dados</div>
              ) : stats.programStatus.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Nenhum programa cadastrado</div>
              ) : (
                <ProgramStatusChart data={stats.programStatus} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

