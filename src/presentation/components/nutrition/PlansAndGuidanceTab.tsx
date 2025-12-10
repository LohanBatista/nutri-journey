"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  useNutritionPlans,
  useCreateNutritionPlan,
  useUpdateNutritionPlan,
  useNutritionGeneralGuidance,
  useCreateNutritionGeneralGuidance,
} from "../../nutrition/hooks";
import {
  Plus,
  Edit,
  Check,
  X,
  Droplet,
  Activity,
  Moon,
  AlertCircle,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useSessionStore } from "../../stores/session-store";
import type { MealType } from "@/domain/entities/NutritionPlan";

const mealTypeOptions: { value: MealType; label: string }[] = [
  { value: "BREAKFAST", label: "Café da Manhã" },
  { value: "MORNING_SNACK", label: "Lanche da Manhã" },
  { value: "LUNCH", label: "Almoço" },
  { value: "AFTERNOON_SNACK", label: "Lanche da Tarde" },
  { value: "DINNER", label: "Jantar" },
  { value: "SUPPER", label: "Ceia" },
  { value: "OTHER", label: "Outro" },
];

interface PlansAndGuidanceTabProps {
  patientId: string;
}

export function PlansAndGuidanceTab({ patientId }: PlansAndGuidanceTabProps) {
  const { organization } = useSessionStore();
  const {
    nutritionPlans,
    loading: plansLoading,
    refetch: refetchPlans,
  } = useNutritionPlans(patientId);
  const { createNutritionPlan, loading: creatingPlan } =
    useCreateNutritionPlan();
  const { updateNutritionPlan, loading: updatingPlan } =
    useUpdateNutritionPlan();
  const {
    latestGuidance,
    loading: guidanceLoading,
    refetch: refetchGuidance,
  } = useNutritionGeneralGuidance(patientId);
  const { createNutritionGeneralGuidance, loading: creatingGuidance } =
    useCreateNutritionGeneralGuidance();

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showGuidanceForm, setShowGuidanceForm] = useState(false);
  const [showEducationMaterialForm, setShowEducationMaterialForm] = useState(false);
  const [generatingEducationMaterial, setGeneratingEducationMaterial] = useState(false);
  const [educationTopic, setEducationTopic] = useState("");
  const [educationText, setEducationText] = useState("");
  const [educationError, setEducationError] = useState<string | null>(null);

  const [planForm, setPlanForm] = useState({
    title: "",
    goals: "",
    notes: "",
    isActive: true,
    meals: [] as {
      mealType: MealType;
      description: string;
      observation: string;
    }[],
  });

  const [guidanceForm, setGuidanceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    hydrationGuidance: "",
    physicalActivityGuidance: "",
    sleepGuidance: "",
    symptomManagementGuidance: "",
    notes: "",
  });

  const handleCreatePlan = async () => {
    try {
      await createNutritionPlan({
        patientId,
        title: planForm.title,
        goals: planForm.goals,
        notes: planForm.notes || null,
        isActive: planForm.isActive,
        meals: planForm.meals.map((m) => ({
          mealType: m.mealType,
          description: m.description,
          observation: m.observation || null,
        })),
      });
      setShowPlanForm(false);
      setPlanForm({
        title: "",
        goals: "",
        notes: "",
        isActive: true,
        meals: [],
      });
      await refetchPlans();
    } catch (error) {
      console.error("Erro ao criar plano:", error);
    }
  };

  const handleUpdatePlan = async (id: string) => {
    try {
      await updateNutritionPlan(id, {
        title: planForm.title,
        goals: planForm.goals,
        notes: planForm.notes || null,
        isActive: planForm.isActive,
      });
      setShowPlanForm(false);
      setEditingPlanId(null);
      setPlanForm({
        title: "",
        goals: "",
        notes: "",
        isActive: true,
        meals: [],
      });
      await refetchPlans();
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
    }
  };

  const handleCreateGuidance = async () => {
    try {
      await createNutritionGeneralGuidance({
        patientId,
        date: new Date(guidanceForm.date || new Date().toISOString()),
        hydrationGuidance: guidanceForm.hydrationGuidance || null,
        physicalActivityGuidance: guidanceForm.physicalActivityGuidance || null,
        sleepGuidance: guidanceForm.sleepGuidance || null,
        symptomManagementGuidance:
          guidanceForm.symptomManagementGuidance || null,
        notes: guidanceForm.notes || null,
      });
      setShowGuidanceForm(false);
      setGuidanceForm({
        date: new Date().toISOString().split("T")[0],
        hydrationGuidance: "",
        physicalActivityGuidance: "",
        sleepGuidance: "",
        symptomManagementGuidance: "",
        notes: "",
      });
      await refetchGuidance();
    } catch (error) {
      console.error("Erro ao criar conduta:", error);
    }
  };

  const startEditingPlan = (planId: string) => {
    const plan = nutritionPlans.find((p) => p.id === planId);
    if (plan) {
      setEditingPlanId(planId);
      setPlanForm({
        title: plan.title,
        goals: plan.goals,
        notes: plan.notes || "",
        isActive: plan.isActive,
        meals: (plan.meals || []).map((meal) => ({
          mealType: meal.mealType,
          description: meal.description,
          observation: meal.observation || "",
        })),
      });
      setShowPlanForm(true);
    }
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatMealType = (mealType: MealType): string => {
    return (
      mealTypeOptions.find((opt) => opt.value === mealType)?.label || mealType
    );
  };

  return (
    <div className="space-y-6">
      {/* Seção de Planos Nutricionais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">
            Planos Nutricionais
          </h3>
          <Button
            onClick={() => {
              setShowPlanForm(!showPlanForm);
              setEditingPlanId(null);
              setPlanForm({
                title: "",
                goals: "",
                notes: "",
                isActive: true,
                meals: [],
              });
            }}
            className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>

        {showPlanForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingPlanId ? "Editar Plano" : "Novo Plano Nutricional"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={planForm.title}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, title: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Ex: Plano para Perda de Peso"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-slate-300">
                    Objetivos
                  </Label>
                  <Textarea
                    id="goals"
                    value={planForm.goals}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, goals: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    placeholder="Descreva os objetivos do plano..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-300">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    value={planForm.notes}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, notes: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={planForm.isActive}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="isActive"
                    className="text-slate-300 cursor-pointer"
                  >
                    Plano Ativo
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (editingPlanId) {
                        handleUpdatePlan(editingPlanId);
                      } else {
                        handleCreatePlan();
                      }
                    }}
                    disabled={
                      creatingPlan ||
                      updatingPlan ||
                      !planForm.title ||
                      !planForm.goals
                    }
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {editingPlanId ? "Salvar" : "Criar"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPlanForm(false);
                      setEditingPlanId(null);
                      setPlanForm({
                        title: "",
                        goals: "",
                        notes: "",
                        isActive: true,
                        meals: [],
                      });
                    }}
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {plansLoading ? (
          <div className="text-slate-400">Carregando planos...</div>
        ) : nutritionPlans.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">
                Nenhum plano nutricional cadastrado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {nutritionPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`backdrop-blur-md rounded-2xl shadow-lg border ${
                    plan.isActive
                      ? "bg-primary/10 border-primary/30"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-white">
                            {plan.title}
                          </CardTitle>
                          {plan.isActive && (
                            <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          Criado em {formatDate(plan.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditingPlan(plan.id)}
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Objetivos:</p>
                      <p className="text-white whitespace-pre-wrap">
                        {plan.goals}
                      </p>
                    </div>
                    {plan.notes && (
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          Observações:
                        </p>
                        <p className="text-white whitespace-pre-wrap">
                          {plan.notes}
                        </p>
                      </div>
                    )}
                    {plan.meals && plan.meals.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          Refeições:
                        </p>
                        <div className="space-y-2">
                          {plan.meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="p-3 rounded-lg bg-white/5 border border-white/10"
                            >
                              <p className="text-sm font-medium text-white">
                                {formatMealType(meal.mealType)}
                              </p>
                              <p className="text-sm text-slate-300 mt-1">
                                {meal.description}
                              </p>
                              {meal.observation && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Obs: {meal.observation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Seção de Condutas Gerais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Condutas Gerais</h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setShowEducationMaterialForm(!showEducationMaterialForm);
                setEducationTopic("");
                setEducationText("");
                setEducationError(null);
              }}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Texto Educativo (IA)
            </Button>
            <Button
              onClick={() => {
                setShowGuidanceForm(!showGuidanceForm);
                if (latestGuidance) {
                  setGuidanceForm({
                    date: new Date(latestGuidance.date)
                      .toISOString()
                      .split("T")[0],
                    hydrationGuidance: latestGuidance.hydrationGuidance || "",
                    physicalActivityGuidance:
                      latestGuidance.physicalActivityGuidance || "",
                    sleepGuidance: latestGuidance.sleepGuidance || "",
                    symptomManagementGuidance:
                      latestGuidance.symptomManagementGuidance || "",
                    notes: latestGuidance.notes || "",
                  });
                }
              }}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              {latestGuidance ? "Atualizar Conduta" : "Nova Conduta"}
            </Button>
          </div>
        </div>

        {/* Formulário de Material Educativo */}
        {showEducationMaterialForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Gerar Texto Educativo com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="education-topic" className="text-slate-300">
                    Tópico do Material Educativo
                  </Label>
                  <Input
                    id="education-topic"
                    placeholder="Ex: Alimentação saudável para diabetes"
                    value={educationTopic}
                    onChange={(e) => setEducationTopic(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                {educationError && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {educationError}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    onClick={async () => {
                      if (!educationTopic.trim() || !organization) {
                        setEducationError("Tópico é obrigatório");
                        return;
                      }

                      setGeneratingEducationMaterial(true);
                      setEducationError(null);

                      try {
                        const response = await fetch("/api/education-materials", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            organizationId: organization.id,
                            topic: educationTopic,
                            context: "INDIVIDUAL",
                            patientId,
                          }),
                        });

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({}));
                          throw new Error(errorData.error || "Erro ao gerar material educativo");
                        }

                        const result = await response.json();
                        setEducationText(result.material.text);
                      } catch (err) {
                        setEducationError(err instanceof Error ? err.message : "Erro desconhecido");
                      } finally {
                        setGeneratingEducationMaterial(false);
                      }
                    }}
                    disabled={generatingEducationMaterial || !educationTopic.trim()}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {generatingEducationMaterial ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Texto
                      </>
                    )}
                  </Button>
                </div>

                {educationText && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Texto Gerado (editável)</Label>
                    <Textarea
                      value={educationText}
                      onChange={(e) => setEducationText(e.target.value)}
                      className="bg-white/5 border-white/10 text-white min-h-[200px]"
                      placeholder="O texto gerado aparecerá aqui..."
                    />
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-300">
                          Conteúdo gerado por IA. Revisar antes de utilizar na prática clínica.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showGuidanceForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Condutas Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guidance-date" className="text-slate-300">
                    Data
                  </Label>
                  <Input
                    id="guidance-date"
                    type="date"
                    value={
                      guidanceForm.date ||
                      new Date().toISOString().split("T")[0]
                    }
                    onChange={(e) =>
                      setGuidanceForm({ ...guidanceForm, date: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="hydration"
                    className="text-slate-300 flex items-center gap-2"
                  >
                    <Droplet className="w-4 h-4" />
                    Hidratação
                  </Label>
                  <Textarea
                    id="hydration"
                    value={guidanceForm.hydrationGuidance}
                    onChange={(e) =>
                      setGuidanceForm({
                        ...guidanceForm,
                        hydrationGuidance: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                    placeholder="Orientações sobre hidratação..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="activity"
                    className="text-slate-300 flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    Atividade Física
                  </Label>
                  <Textarea
                    id="activity"
                    value={guidanceForm.physicalActivityGuidance}
                    onChange={(e) =>
                      setGuidanceForm({
                        ...guidanceForm,
                        physicalActivityGuidance: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                    placeholder="Orientações sobre atividade física..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sleep"
                    className="text-slate-300 flex items-center gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    Sono
                  </Label>
                  <Textarea
                    id="sleep"
                    value={guidanceForm.sleepGuidance}
                    onChange={(e) =>
                      setGuidanceForm({
                        ...guidanceForm,
                        sleepGuidance: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                    placeholder="Orientações sobre sono..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="symptoms"
                    className="text-slate-300 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Gerenciamento de Sintomas
                  </Label>
                  <Textarea
                    id="symptoms"
                    value={guidanceForm.symptomManagementGuidance}
                    onChange={(e) =>
                      setGuidanceForm({
                        ...guidanceForm,
                        symptomManagementGuidance: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                    placeholder="Orientações sobre gerenciamento de sintomas..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guidance-notes" className="text-slate-300">
                    Observações
                  </Label>
                  <Textarea
                    id="guidance-notes"
                    value={guidanceForm.notes}
                    onChange={(e) =>
                      setGuidanceForm({
                        ...guidanceForm,
                        notes: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateGuidance}
                    disabled={creatingGuidance}
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowGuidanceForm(false);
                      setGuidanceForm({
                        date: new Date().toISOString().split("T")[0],
                        hydrationGuidance: "",
                        physicalActivityGuidance: "",
                        sleepGuidance: "",
                        symptomManagementGuidance: "",
                        notes: "",
                      });
                    }}
                    variant="ghost"
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {guidanceLoading ? (
          <div className="text-slate-400">Carregando condutas...</div>
        ) : latestGuidance ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">
                  Condutas Gerais - {formatDate(latestGuidance.date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestGuidance.hydrationGuidance && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-slate-300">
                        Hidratação
                      </p>
                    </div>
                    <p className="text-white whitespace-pre-wrap">
                      {latestGuidance.hydrationGuidance}
                    </p>
                  </div>
                )}

                {latestGuidance.physicalActivityGuidance && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-slate-300">
                        Atividade Física
                      </p>
                    </div>
                    <p className="text-white whitespace-pre-wrap">
                      {latestGuidance.physicalActivityGuidance}
                    </p>
                  </div>
                )}

                {latestGuidance.sleepGuidance && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-slate-300">Sono</p>
                    </div>
                    <p className="text-white whitespace-pre-wrap">
                      {latestGuidance.sleepGuidance}
                    </p>
                  </div>
                )}

                {latestGuidance.symptomManagementGuidance && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-slate-300">
                        Gerenciamento de Sintomas
                      </p>
                    </div>
                    <p className="text-white whitespace-pre-wrap">
                      {latestGuidance.symptomManagementGuidance}
                    </p>
                  </div>
                )}

                {latestGuidance.notes && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">
                      Observações
                    </p>
                    <p className="text-white whitespace-pre-wrap">
                      {latestGuidance.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-center">
                Nenhuma conduta geral cadastrada.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
