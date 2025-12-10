"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { useSessionStore } from "../../stores/session-store";

interface AiSummary {
  id: string;
  type: "WEEKLY_OVERVIEW" | "FULL_HISTORY" | "PRE_CONSULT";
  periodStart: Date | null;
  periodEnd: Date | null;
  textForProfessional: string;
  createdAt: Date;
}

interface PatientAiInsightsTabProps {
  patientId: string;
}

const summaryTypeOptions: {
  value: "WEEKLY_OVERVIEW" | "FULL_HISTORY" | "PRE_CONSULT";
  label: string;
}[] = [
  { value: "WEEKLY_OVERVIEW", label: "Visão Semanal" },
  { value: "FULL_HISTORY", label: "Histórico Completo" },
  { value: "PRE_CONSULT", label: "Pré-Consulta" },
];

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

function formatSummaryType(type: string): string {
  const typeMap: Record<string, string> = {
    WEEKLY_OVERVIEW: "Visão Semanal",
    FULL_HISTORY: "Histórico Completo",
    PRE_CONSULT: "Pré-Consulta",
  };
  return typeMap[type] || type;
}

function getSummaryPreview(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function PatientAiInsightsTab({ patientId }: PatientAiInsightsTabProps) {
  const { organization, professional } = useSessionStore();
  const [summaries, setSummaries] = useState<AiSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(
    null
  );
  const [summaryType, setSummaryType] = useState<
    "WEEKLY_OVERVIEW" | "FULL_HISTORY" | "PRE_CONSULT"
  >("WEEKLY_OVERVIEW");
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization || !professional) return;

    const fetchSummaries = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          patientId,
          organizationId: organization.id,
        });

        const response = await fetch(`/api/ai-summaries?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Erro ao carregar resumos");
        }

        const data = await response.json();
        // Converter strings ISO de volta para Date
        const summariesWithDates = (data.summaries || []).map(
          (s: {
            id: string;
            type: "WEEKLY_OVERVIEW" | "FULL_HISTORY" | "PRE_CONSULT";
            periodStart: string | null;
            periodEnd: string | null;
            textForProfessional: string;
            createdAt: string;
          }) => ({
            ...s,
            periodStart: s.periodStart ? new Date(s.periodStart) : null,
            periodEnd: s.periodEnd ? new Date(s.periodEnd) : null,
            createdAt: new Date(s.createdAt),
          })
        );
        setSummaries(summariesWithDates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    void fetchSummaries();
  }, [patientId, organization, professional]);

  if (!organization || !professional) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Erro: Sessão não encontrada</p>
      </div>
    );
  }

  const organizationId = organization.id;
  const professionalId = professional.id;

  const handleGenerateSummary = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-summaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          professionalId,
          patientId,
          summaryType,
          periodStart: periodStart || null,
          periodEnd: periodEnd || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar resumo");
      }

      const result = await response.json();

      // Converter strings ISO de volta para Date
      const newSummary = {
        ...result.aiSummary,
        periodStart: result.aiSummary.periodStart
          ? new Date(result.aiSummary.periodStart)
          : null,
        periodEnd: result.aiSummary.periodEnd
          ? new Date(result.aiSummary.periodEnd)
          : null,
        createdAt: new Date(result.aiSummary.createdAt),
      };

      // Adicionar o novo resumo à lista
      setSummaries((prev) => [newSummary, ...prev]);

      // Limpar formulário
      setPeriodStart("");
      setPeriodEnd("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar resumo");
    } finally {
      setGenerating(false);
    }
  };

  const toggleSummary = (summaryId: string) => {
    setExpandedSummaryId(expandedSummaryId === summaryId ? null : summaryId);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de geração */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Gerar Resumo com IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary-type" className="text-slate-300">
                Tipo de Resumo
              </Label>
              <select
                id="summary-type"
                value={summaryType}
                onChange={(e) =>
                  setSummaryType(
                    e.target.value as
                      | "WEEKLY_OVERVIEW"
                      | "FULL_HISTORY"
                      | "PRE_CONSULT"
                  )
                }
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {summaryTypeOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-slate-900"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period-start" className="text-slate-300">
                  Data Início (Opcional)
                </Label>
                <Input
                  id="period-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="period-end" className="text-slate-300">
                  Data Fim (Opcional)
                </Label>
                <Input
                  id="period-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateSummary}
              disabled={generating}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando resumo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Resumo com IA
                </>
              )}
            </Button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Lista de resumos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Resumos Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : summaries.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhum resumo gerado ainda.</p>
                <p className="text-sm mt-2">
                  Use o formulário acima para gerar o primeiro resumo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {summaries.map((summary, index) => (
                    <motion.div
                      key={summary.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleSummary(summary.id)}
                            className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                                    {formatSummaryType(summary.type)}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {formatDateTime(summary.createdAt)}
                                  </span>
                                </div>
                                {summary.periodStart && summary.periodEnd && (
                                  <p className="text-xs text-slate-400 mb-2">
                                    Período: {formatDate(summary.periodStart)} -{" "}
                                    {formatDate(summary.periodEnd)}
                                  </p>
                                )}
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                  {expandedSummaryId === summary.id
                                    ? summary.textForProfessional
                                    : getSummaryPreview(
                                        summary.textForProfessional
                                      )}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {expandedSummaryId === summary.id ? (
                                  <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedSummaryId === summary.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 border-t border-white/10 pt-4">
                                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                      <p className="text-xs text-amber-300">
                                        <strong>Texto sugerido por IA.</strong>{" "}
                                        Revisar antes de utilizar.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="prose prose-invert max-w-none">
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                      {summary.textForProfessional}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
