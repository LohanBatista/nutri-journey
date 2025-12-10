"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Users, Calendar, Activity, CheckCircle2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface OrganizationAnalytics {
  activePatientsCount: number;
  consultationsCount: number;
  activeProgramsCount: number;
  finishedProgramsCount: number;
}

type PeriodOption = "7days" | "30days" | "90days" | "custom";

interface PeriodDates {
  startDate: Date;
  endDate: Date;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>("30days");
  const [customDates, setCustomDates] = useState<PeriodDates | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const getPeriodDates = (period: PeriodOption): PeriodDates | null => {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    let startDate = new Date();

    switch (period) {
      case "7days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "custom":
        return customDates;
      default:
        return null;
    }

    startDate.setHours(0, 0, 0, 0);
    return { startDate, endDate };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const periodDates = getPeriodDates(selectedPeriod);
      let url = "/api/analytics/organization";

      if (periodDates) {
        const params = new URLSearchParams({
          startDate: periodDates.startDate.toISOString(),
          endDate: periodDates.endDate.toISOString(),
        });
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao buscar analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, customDates]);

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    if (!value) return;

    const date = new Date(value);
    if (isNaN(date.getTime())) return;

    if (type === "start") {
      setCustomDates((prev) => ({
        startDate: date,
        endDate: prev?.endDate || new Date(),
      }));
    } else {
      setCustomDates((prev) => ({
        startDate: prev?.startDate || new Date(),
        endDate: date,
      }));
    }
  };

  const handleApplyCustomPeriod = () => {
    if (customDates && customDates.startDate <= customDates.endDate) {
      setSelectedPeriod("custom");
      setShowCustomPicker(false);
    }
  };

  const chartData = analytics
    ? [
        {
          name: "Pacientes",
          value: analytics.activePatientsCount,
        },
        {
          name: "Consultas",
          value: analytics.consultationsCount,
        },
        {
          name: "Programas Ativos",
          value: analytics.activeProgramsCount,
        },
        {
          name: "Programas Finalizados",
          value: analytics.finishedProgramsCount,
        },
      ]
    : [];

  const programsPieData = analytics
    ? [
        {
          name: "Ativos",
          value: analytics.activeProgramsCount,
        },
        {
          name: "Finalizados",
          value: analytics.finishedProgramsCount,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Carregando relatórios...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-400">Erro: {error || "Dados não encontrados"}</div>
        <Button
          onClick={() => void fetchAnalytics()}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-400 mt-1">Visão gerencial da organização</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === "7days" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("7days")}
              className={
                selectedPeriod === "7days"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
              }
            >
              7 dias
            </Button>
            <Button
              variant={selectedPeriod === "30days" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("30days")}
              className={
                selectedPeriod === "30days"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
              }
            >
              30 dias
            </Button>
            <Button
              variant={selectedPeriod === "90days" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("90days")}
              className={
                selectedPeriod === "90days"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
              }
            >
              90 dias
            </Button>
            <Button
              variant={selectedPeriod === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCustomPicker(!showCustomPicker)}
              className={
                selectedPeriod === "custom"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
              }
            >
              Personalizado
            </Button>
          </div>
        </div>
      </motion.div>

      {showCustomPicker && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Data Inicial</label>
              <input
                type="date"
                value={
                  customDates?.startDate
                    ? customDates.startDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleCustomDateChange("start", e.target.value)}
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Data Final</label>
              <input
                type="date"
                value={
                  customDates?.endDate
                    ? customDates.endDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => handleCustomDateChange("end", e.target.value)}
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleApplyCustomPeriod}
              disabled={!customDates || customDates.startDate > customDates.endDate}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              Aplicar
            </Button>
            <Button
              onClick={() => setShowCustomPicker(false)}
              variant="outline"
              size="sm"
              className="bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
            >
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Pacientes Ativos
              </CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {analytics.activePatientsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total cadastrado</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Consultas
              </CardTitle>
              <Calendar className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {analytics.consultationsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">No período selecionado</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Programas Ativos
              </CardTitle>
              <Activity className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {analytics.activeProgramsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Em andamento</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg hover:bg-white/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Programas Finalizados
              </CardTitle>
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {analytics.finishedProgramsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Concluídos</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Visão Geral das Métricas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Distribuição de Programas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={programsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {programsPieData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#94a3b8" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Resumo Executivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  Distribuição de Programas
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Ativos</span>
                    <span className="text-white font-semibold">
                      {analytics.activeProgramsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm">Finalizados</span>
                    <span className="text-white font-semibold">
                      {analytics.finishedProgramsCount}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          analytics.activeProgramsCount +
                            analytics.finishedProgramsCount >
                          0
                            ? (analytics.activeProgramsCount /
                                (analytics.activeProgramsCount +
                                  analytics.finishedProgramsCount)) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  Resumo Geral
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total de Pacientes</span>
                    <span className="text-white font-semibold">
                      {analytics.activePatientsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total de Consultas</span>
                    <span className="text-white font-semibold">
                      {analytics.consultationsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total de Programas</span>
                    <span className="text-white font-semibold">
                      {analytics.activeProgramsCount +
                        analytics.finishedProgramsCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
