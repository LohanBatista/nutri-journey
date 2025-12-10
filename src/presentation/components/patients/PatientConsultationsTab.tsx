"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Stethoscope,
  Plus,
  Edit,
  X,
} from "lucide-react";
import { useSessionStore } from "../../stores/session-store";

interface Consultation {
  id: string;
  dateTime: string;
  type: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
  mainComplaint: string | null;
  nutritionHistory: string | null;
  clinicalHistory: string | null;
  objectiveData: string | null;
  nutritionDiagnosis: string | null;
  plan: string | null;
}

interface NutritionDiagnosisSuggestion {
  id: string;
  consultationId: string | null;
  diagnoses: Array<{
    title: string;
    pesFormat: string | null;
    rationale: string;
  }>;
  createdAt: string;
}

interface PatientConsultationsTabProps {
  patientId: string;
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

function formatConsultationType(type: string): string {
  const typeMap: Record<string, string> = {
    INITIAL: "Consulta Inicial",
    FOLLOW_UP: "Retorno",
    GROUP: "Grupo",
    HOSPITAL: "Hospitalar",
  };
  return typeMap[type] || type;
}

export function PatientConsultationsTab({
  patientId,
}: PatientConsultationsTabProps) {
  const { organization, professional } = useSessionStore();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [diagnosisSuggestions, setDiagnosisSuggestions] = useState<
    Record<string, NutritionDiagnosisSuggestion[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expandedConsultationId, setExpandedConsultationId] = useState<
    string | null
  >(null);
  const [expandedDiagnosisId, setExpandedDiagnosisId] = useState<string | null>(
    null
  );
  const [showDiagnosisPanel, setShowDiagnosisPanel] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingConsultationId, setEditingConsultationId] = useState<
    string | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchConsultations = useCallback(async () => {
    if (!organization) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/patients/${patientId}/consultations?organizationId=${organization.id}`
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar consultas");
      }

      const data = await response.json();
      setConsultations(data.consultations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [patientId, organization]);

  useEffect(() => {
    void fetchConsultations();
  }, [fetchConsultations]);

  useEffect(() => {
    if (!organization || consultations.length === 0) return;

    const fetchDiagnosisSuggestions = async () => {
      const params = new URLSearchParams({
        organizationId: organization.id,
        patientId,
      });

      try {
        const response = await fetch(
          `/api/nutrition-diagnosis-suggestions?${params.toString()}`
        );
        if (response.ok) {
          const data = await response.json();
          const suggestions = data.suggestions || [];

          // Agrupar por consultationId
          const grouped: Record<string, NutritionDiagnosisSuggestion[]> = {};
          suggestions.forEach((s: NutritionDiagnosisSuggestion) => {
            const key = s.consultationId || "general";
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push(s);
          });

          setDiagnosisSuggestions(grouped);
        }
      } catch (err) {
        // Ignorar erro silenciosamente
      }
    };

    void fetchDiagnosisSuggestions();
  }, [patientId, organization, consultations]);

  const handleGenerateDiagnosis = async (consultationId: string | null) => {
    if (!organization || !professional) return;

    setGenerating(consultationId || "general");
    setError(null);

    try {
      const response = await fetch("/api/nutrition-diagnosis-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: organization.id,
          professionalId: professional.id,
          patientId,
          consultationId: consultationId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao gerar diagnóstico");
      }

      const result = await response.json();
      const suggestion = result.suggestion;

      // Atualizar estado
      const key = suggestion.consultationId || "general";
      setDiagnosisSuggestions((prev) => ({
        ...prev,
        [key]: [suggestion, ...(prev[key] || [])],
      }));

      setShowDiagnosisPanel(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar diagnóstico");
    } finally {
      setGenerating(null);
    }
  };

  const handleCreateConsultation = async (formData: {
    dateTime: string;
    type: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
    mainComplaint?: string | null;
    nutritionHistory?: string | null;
    clinicalHistory?: string | null;
    objectiveData?: string | null;
    nutritionDiagnosis?: string | null;
    plan?: string | null;
  }) => {
    if (!organization || !professional) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/patients/${patientId}/consultations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            organizationId: organization.id,
            professionalId: professional.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao criar consulta");
      }

      setShowCreateModal(false);
      setEditingConsultationId(null);
      await fetchConsultations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar consulta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateConsultation = async (
    consultationId: string,
    formData: {
      dateTime?: string;
      type?: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
      mainComplaint?: string | null;
      nutritionHistory?: string | null;
      clinicalHistory?: string | null;
      objectiveData?: string | null;
      nutritionDiagnosis?: string | null;
      plan?: string | null;
    }
  ) => {
    if (!organization) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          organizationId: organization.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao atualizar consulta");
      }

      setEditingConsultationId(null);
      setShowCreateModal(false);
      await fetchConsultations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar consulta"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!organization || !professional) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Erro: Sessão não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Consultas</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    // Salvar posição atual do scroll antes de abrir
                    const scrollY = window.scrollY;
                    setShowCreateModal(true);
                    setEditingConsultationId(null);
                    // Restaurar posição do scroll após um pequeno delay
                    setTimeout(() => {
                      window.scrollTo({ top: scrollY, behavior: 'instant' });
                    }, 0);
                  }}
                  className="bg-primary hover:bg-primary/90 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Consulta
                </Button>
                <Button
                  onClick={() => handleGenerateDiagnosis(null)}
                  disabled={generating === "general"}
                  className="bg-primary/80 hover:bg-primary/70 text-white"
                  size="sm"
                >
                  {generating === "general" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Sugerir Diagnóstico (IA)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Formulário de criação/edição expansível */}
            <AnimatePresence>
              {(showCreateModal || editingConsultationId) && (
                <motion.div
                  ref={formRef}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "500px", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                  style={{ 
                    height: "500px",
                    maxHeight: "500px",
                    overflow: "hidden"
                  }}
                  onAnimationStart={() => {
                    // Prevenir scroll automático quando o formulário expande
                    const currentScroll = window.scrollY;
                    const checkScroll = setInterval(() => {
                      if (window.scrollY !== currentScroll) {
                        window.scrollTo({ top: currentScroll, behavior: 'instant' });
                      }
                    }, 10);
                    setTimeout(() => clearInterval(checkScroll), 300);
                  }}
                >
                  <Card 
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl h-full flex flex-col"
                    data-consultation-form
                    style={{ height: "100%" }}
                  >
                    <CardHeader className="flex-shrink-0 border-b border-white/10 pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          {editingConsultationId ? "Editar Consulta" : "Nova Consulta"}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCreateModal(false);
                            setEditingConsultationId(null);
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent 
                      className="overflow-y-auto flex-1 min-h-0 pr-2" 
                      style={{ 
                        height: "calc(500px - 80px)",
                        maxHeight: "calc(500px - 80px)"
                      }}
                    >
                      <ConsultationForm
                        consultation={
                          editingConsultationId
                            ? consultations.find((c) => c.id === editingConsultationId) || null
                            : null
                        }
                        onSubmit={(formData) => {
                          if (editingConsultationId) {
                            handleUpdateConsultation(editingConsultationId, formData);
                          } else {
                            handleCreateConsultation(formData);
                          }
                        }}
                        onCancel={() => {
                          setShowCreateModal(false);
                          setEditingConsultationId(null);
                        }}
                        submitting={submitting}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhuma consulta registrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <motion.div
                    key={consultation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden">
                      <CardContent className="p-0">
                        <button
                          onClick={() =>
                            setExpandedConsultationId(
                              expandedConsultationId === consultation.id
                                ? null
                                : consultation.id
                            )
                          }
                          className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                                  {formatConsultationType(consultation.type)}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {formatDateTime(consultation.dateTime)}
                                </span>
                              </div>
                              {consultation.mainComplaint && (
                                <p className="text-sm text-slate-300">
                                  {consultation.mainComplaint}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Salvar posição atual do scroll antes de abrir
                                  const scrollY = window.scrollY;
                                  setEditingConsultationId(consultation.id);
                                  // Restaurar posição do scroll após um pequeno delay
                                  setTimeout(() => {
                                    window.scrollTo({ top: scrollY, behavior: 'instant' });
                                  }, 0);
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateDiagnosis(consultation.id);
                                }}
                                disabled={generating === consultation.id}
                                size="sm"
                                variant="ghost"
                                className="text-primary hover:text-primary/80"
                              >
                                {generating === consultation.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Stethoscope className="w-4 h-4" />
                                )}
                              </Button>
                              {expandedConsultationId === consultation.id ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedConsultationId === consultation.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                                {consultation.mainComplaint && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">
                                      Queixa Principal
                                    </p>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                      {consultation.mainComplaint}
                                    </p>
                                  </div>
                                )}
                                {consultation.nutritionHistory && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">
                                      História Nutricional
                                    </p>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                      {consultation.nutritionHistory}
                                    </p>
                                  </div>
                                )}
                                {consultation.clinicalHistory && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">
                                      História Clínica
                                    </p>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                      {consultation.clinicalHistory}
                                    </p>
                                  </div>
                                )}
                                {consultation.objectiveData && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">
                                      Dados Objetivos
                                    </p>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                      {consultation.objectiveData}
                                    </p>
                                  </div>
                                )}
                                {consultation.nutritionDiagnosis && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">
                                      Diagnóstico Nutricional
                                    </p>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                      {consultation.nutritionDiagnosis}
                                    </p>
                                  </div>
                                )}
                                {consultation.plan && (
                                  <div>
                                    <p className="text-xs text-slate-400 mb-1">
                                      Plano
                                    </p>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                      {consultation.plan}
                                    </p>
                                  </div>
                                )}

                                {/* Sugestões de diagnóstico IA */}
                                {(() => {
                                  const suggestions = diagnosisSuggestions[consultation.id];
                                  if (!suggestions || suggestions.length === 0) return null;
                                  
                                  return (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                      <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-semibold text-primary">
                                          Sugestões de Diagnóstico (IA)
                                        </p>
                                        <Button
                                          onClick={() =>
                                            setShowDiagnosisPanel(
                                              showDiagnosisPanel === consultation.id
                                                ? null
                                                : consultation.id
                                            )
                                          }
                                          size="sm"
                                          variant="ghost"
                                          className="text-xs"
                                        >
                                          {showDiagnosisPanel === consultation.id
                                            ? "Ocultar"
                                            : "Mostrar"}
                                        </Button>
                                      </div>

                                      <AnimatePresence>
                                        {showDiagnosisPanel === consultation.id && (
                                          <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-3"
                                          >
                                            {suggestions.map((suggestion) => (
                                            <Card
                                              key={suggestion.id}
                                              className="bg-primary/10 border-primary/20 rounded-lg p-3"
                                            >
                                              <div className="space-y-2">
                                                {suggestion.diagnoses.map(
                                                  (diagnosis, idx) => (
                                                    <div
                                                      key={idx}
                                                      className="space-y-1"
                                                    >
                                                      <p className="text-sm font-semibold text-white">
                                                        {diagnosis.title}
                                                      </p>
                                                      {diagnosis.pesFormat && (
                                                        <p className="text-xs text-slate-300 italic">
                                                          {diagnosis.pesFormat}
                                                        </p>
                                                      )}
                                                      <p className="text-xs text-slate-400">
                                                        {diagnosis.rationale}
                                                      </p>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                              <div className="mt-2 pt-2 border-t border-white/10">
                                                <div className="flex items-start gap-2">
                                                  <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                                                  <p className="text-xs text-amber-300">
                                                    Conteúdo gerado por IA.
                                                    Revisar antes de utilizar na
                                                    prática clínica.
                                                  </p>
                                                </div>
                                              </div>
                                            </Card>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>


      {/* Painel de diagnóstico geral (sem consulta específica) */}
      {diagnosisSuggestions["general"] &&
        diagnosisSuggestions["general"].length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Sugestões de Diagnóstico em Nutrição (IA)
                  </CardTitle>
                  <Button
                    onClick={() =>
                      setShowDiagnosisPanel(
                        showDiagnosisPanel === "general" ? null : "general"
                      )
                    }
                    size="sm"
                    variant="ghost"
                  >
                    {showDiagnosisPanel === "general" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <AnimatePresence>
                {showDiagnosisPanel === "general" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="space-y-3">
                      {diagnosisSuggestions["general"].map((suggestion) => (
                        <Card
                          key={suggestion.id}
                          className="bg-primary/10 border-primary/20 rounded-lg p-4"
                        >
                          <div className="space-y-3">
                            {suggestion.diagnoses.map((diagnosis, idx) => (
                              <div key={idx} className="space-y-2">
                                <p className="text-sm font-semibold text-white">
                                  {diagnosis.title}
                                </p>
                                {diagnosis.pesFormat && (
                                  <p className="text-xs text-slate-300 italic">
                                    {diagnosis.pesFormat}
                                  </p>
                                )}
                                <p className="text-xs text-slate-400">
                                  {diagnosis.rationale}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-amber-300">
                                Conteúdo gerado por IA. Revisar antes de
                                utilizar na prática clínica.
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
    </div>
  );
}

function ConsultationForm({
  consultation,
  onSubmit,
  onCancel,
  submitting,
}: {
  consultation: Consultation | null;
  onSubmit: (data: {
    dateTime: string;
    type: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
    mainComplaint?: string | null;
    nutritionHistory?: string | null;
    clinicalHistory?: string | null;
    objectiveData?: string | null;
    nutritionDiagnosis?: string | null;
    plan?: string | null;
  }) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState({
    dateTime: consultation
      ? new Date(consultation.dateTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    type: (consultation?.type || "INITIAL") as
      | "INITIAL"
      | "FOLLOW_UP"
      | "GROUP"
      | "HOSPITAL",
    mainComplaint: consultation?.mainComplaint || "",
    nutritionHistory: consultation?.nutritionHistory || "",
    clinicalHistory: consultation?.clinicalHistory || "",
    objectiveData: consultation?.objectiveData || "",
    nutritionDiagnosis: consultation?.nutritionDiagnosis || "",
    plan: consultation?.plan || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      dateTime: new Date(formData.dateTime).toISOString(),
      type: formData.type,
      mainComplaint: formData.mainComplaint || null,
      nutritionHistory: formData.nutritionHistory || null,
      clinicalHistory: formData.clinicalHistory || null,
      objectiveData: formData.objectiveData || null,
      nutritionDiagnosis: formData.nutritionDiagnosis || null,
      plan: formData.plan || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateTime" className="text-slate-300">
            Data e Hora *
          </Label>
          <Input
            id="dateTime"
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) =>
              setFormData({ ...formData, dateTime: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type" className="text-slate-300">
            Tipo *
          </Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as
                  | "INITIAL"
                  | "FOLLOW_UP"
                  | "GROUP"
                  | "HOSPITAL",
              })
            }
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            required
          >
            <option value="INITIAL">Consulta Inicial</option>
            <option value="FOLLOW_UP">Retorno</option>
            <option value="GROUP">Grupo</option>
            <option value="HOSPITAL">Hospitalar</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mainComplaint" className="text-slate-300">
          Queixa Principal
        </Label>
        <Textarea
          id="mainComplaint"
          value={formData.mainComplaint}
          onChange={(e) =>
            setFormData({ ...formData, mainComplaint: e.target.value })
          }
          className="bg-white/5 border-white/10 text-white min-h-[80px]"
          placeholder="Descreva a queixa principal do paciente..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nutritionHistory" className="text-slate-300">
          História Nutricional
        </Label>
        <Textarea
          id="nutritionHistory"
          value={formData.nutritionHistory}
          onChange={(e) =>
            setFormData({ ...formData, nutritionHistory: e.target.value })
          }
          className="bg-white/5 border-white/10 text-white min-h-[100px]"
          placeholder="História nutricional do paciente..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinicalHistory" className="text-slate-300">
          História Clínica
        </Label>
        <Textarea
          id="clinicalHistory"
          value={formData.clinicalHistory}
          onChange={(e) =>
            setFormData({ ...formData, clinicalHistory: e.target.value })
          }
          className="bg-white/5 border-white/10 text-white min-h-[100px]"
          placeholder="História clínica do paciente..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="objectiveData" className="text-slate-300">
          Dados Objetivos
        </Label>
        <Textarea
          id="objectiveData"
          value={formData.objectiveData}
          onChange={(e) =>
            setFormData({ ...formData, objectiveData: e.target.value })
          }
          className="bg-white/5 border-white/10 text-white min-h-[100px]"
          placeholder="Dados objetivos (exames, medidas, etc.)..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nutritionDiagnosis" className="text-slate-300">
          Diagnóstico Nutricional
        </Label>
        <Textarea
          id="nutritionDiagnosis"
          value={formData.nutritionDiagnosis}
          onChange={(e) =>
            setFormData({
              ...formData,
              nutritionDiagnosis: e.target.value,
            })
          }
          className="bg-white/5 border-white/10 text-white min-h-[100px]"
          placeholder="Diagnóstico nutricional..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan" className="text-slate-300">
          Plano
        </Label>
        <Textarea
          id="plan"
          value={formData.plan}
          onChange={(e) =>
            setFormData({ ...formData, plan: e.target.value })
          }
          className="bg-white/5 border-white/10 text-white min-h-[120px]"
          placeholder="Plano de ação nutricional..."
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : consultation ? (
            "Salvar"
          ) : (
            "Criar"
          )}
        </Button>
      </div>
    </form>
  );
}

