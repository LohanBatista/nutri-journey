"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useSessionStore } from "../../stores/session-store";

interface ProgramSummary {
  id: string;
  type: "MEETING_SUMMARY" | "PROGRAM_OVERVIEW";
  meetingId: string | null;
  text: string;
  createdAt: string;
}

interface ProgramMeeting {
  id: string;
  date: string;
  topic: string;
}

interface ProgramAiTabProps {
  programId: string;
  meetings: ProgramMeeting[];
}

function formatDateTime(date: string): string {
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
    MEETING_SUMMARY: "Resumo de Encontro",
    PROGRAM_OVERVIEW: "Resumo Geral do Programa",
  };
  return typeMap[type] || type;
}

export function ProgramAiTab({ programId, meetings }: ProgramAiTabProps) {
  const { organization } = useSessionStore();
  const [summaries, setSummaries] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(
    null
  );
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
  const [summaryType, setSummaryType] = useState<
    "MEETING_SUMMARY" | "PROGRAM_OVERVIEW"
  >("PROGRAM_OVERVIEW");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization) return;

    const fetchSummaries = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          programId,
          organizationId: organization.id,
        });

        const response = await fetch(`/api/program-summaries?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Erro ao carregar resumos");
        }

        const data = await response.json();
        setSummaries(data.summaries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    void fetchSummaries();
  }, [programId, organization]);

  const handleGenerateSummary = async () => {
    if (!organization) return;

    if (summaryType === "MEETING_SUMMARY" && !selectedMeetingId) {
      setError("Selecione um encontro para gerar o resumo");
      return;
    }

    setGenerating(summaryType);
    setError(null);

    try {
      const response = await fetch("/api/program-summaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: organization.id,
          programId,
          type: summaryType,
          meetingId: summaryType === "MEETING_SUMMARY" ? selectedMeetingId : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar resumo");
      }

      const result = await response.json();
      const newSummary = result.summary;

      setSummaries((prev) => [newSummary, ...prev]);
      
      if (summaryType === "MEETING_SUMMARY") {
        setSelectedMeetingId("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar resumo");
    } finally {
      setGenerating(null);
    }
  };

  if (!organization) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Erro: Sessão não encontrada</p>
      </div>
    );
  }

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
                    e.target.value as "MEETING_SUMMARY" | "PROGRAM_OVERVIEW"
                  )
                }
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="PROGRAM_OVERVIEW" className="bg-slate-900">
                  Resumo Geral do Programa
                </option>
                <option value="MEETING_SUMMARY" className="bg-slate-900">
                  Resumo de Encontro
                </option>
              </select>
            </div>

            {summaryType === "MEETING_SUMMARY" && (
              <div className="space-y-2">
                <Label htmlFor="meeting-select" className="text-slate-300">
                  Selecionar Encontro
                </Label>
                <select
                  id="meeting-select"
                  value={selectedMeetingId}
                  onChange={(e) => setSelectedMeetingId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" className="bg-slate-900">
                    Selecione um encontro
                  </option>
                  {meetings.map((meeting) => (
                    <option
                      key={meeting.id}
                      value={meeting.id}
                      className="bg-slate-900"
                    >
                      {new Date(meeting.date).toLocaleDateString("pt-BR")} - {meeting.topic}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              onClick={handleGenerateSummary}
              disabled={
                generating !== null ||
                (summaryType === "MEETING_SUMMARY" && !selectedMeetingId)
              }
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
            <CardTitle className="text-white">Resumos Gerados</CardTitle>
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
                            onClick={() =>
                              setExpandedSummaryId(
                                expandedSummaryId === summary.id
                                  ? null
                                  : summary.id
                              )
                            }
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
                                <p className="text-sm text-slate-300 line-clamp-2">
                                  {summary.text.substring(0, 150)}
                                  {summary.text.length > 150 ? "..." : ""}
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
                                        <strong>Conteúdo gerado por IA.</strong>{" "}
                                        Revisar antes de utilizar na prática
                                        clínica.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="prose prose-invert max-w-none">
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                      {summary.text}
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

