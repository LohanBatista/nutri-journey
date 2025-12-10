"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Loader2,
  Plus,
  X,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";
import { useSessionStore } from "../../stores/session-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { LabTestType } from "@/domain/entities/LabResult";

interface LabResult {
  id: string;
  date: string;
  testType: LabTestType;
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PatientLabResultsTabProps {
  patientId: string;
}

const testTypeOptions: { value: LabTestType; label: string }[] = [
  { value: "GLYCEMIA", label: "Glicemia" },
  { value: "HBA1C", label: "HbA1c" },
  { value: "CT", label: "Colesterol Total" },
  { value: "HDL", label: "HDL" },
  { value: "LDL", label: "LDL" },
  { value: "TG", label: "Triglicerídeos" },
  { value: "OTHER", label: "Outro" },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

function formatTestType(testType: LabTestType): string {
  const option = testTypeOptions.find((opt) => opt.value === testType);
  return option?.label || testType;
}

function getTestTypeColor(testType: LabTestType): string {
  const colors: Record<LabTestType, string> = {
    GLYCEMIA: "text-blue-400",
    HBA1C: "text-purple-400",
    CT: "text-orange-400",
    HDL: "text-green-400",
    LDL: "text-red-400",
    TG: "text-yellow-400",
    OTHER: "text-slate-400",
  };
  return colors[testType] || "text-slate-400";
}

function groupLabResultsByDate(labResults: LabResult[]): Map<string, LabResult[]> {
  const grouped = new Map<string, LabResult[]>();
  
  for (const result of labResults) {
    const dateKey = formatDate(result.date);
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(result);
  }
  
  return grouped;
}

export function PatientLabResultsTab({
  patientId,
}: PatientLabResultsTabProps) {
  const { organization, professional } = useSessionStore();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLabResults = useCallback(async () => {
    if (!organization) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/patients/${patientId}/lab-results?organizationId=${organization.id}`
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar exames laboratoriais");
      }

      const data = await response.json();
      setLabResults(data.labResults || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [patientId, organization]);

  useEffect(() => {
    void fetchLabResults();
  }, [fetchLabResults]);

  const handleCreateLabResult = async (formData: {
    date: string;
    testType: LabTestType;
    name: string;
    value: number | string;
    unit: string;
    referenceRange?: string | null;
    notes?: string | null;
  }) => {
    if (!organization || !professional) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/patients/${patientId}/lab-results`,
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
        throw new Error(errorData.error || "Erro ao criar exame");
      }

      setShowCreateModal(false);
      await fetchLabResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar exame");
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

  // Obter últimos valores de exames importantes
  const latestGlycemia = labResults
    .filter((r) => r.testType === "GLYCEMIA")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const latestHbA1c = labResults
    .filter((r) => r.testType === "HBA1C")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const latestCT = labResults
    .filter((r) => r.testType === "CT")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const latestHDL = labResults
    .filter((r) => r.testType === "HDL")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const latestLDL = labResults
    .filter((r) => r.testType === "LDL")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const latestTG = labResults
    .filter((r) => r.testType === "TG")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const hasSummaryData = latestGlycemia || latestHbA1c || latestCT || latestHDL || latestLDL || latestTG;

  const groupedResults = groupLabResultsByDate(labResults);
  const sortedDates = Array.from(groupedResults.keys()).sort((a, b) => {
    // Converter formato DD/MM/YYYY para Date
    const dateA = a.split("/");
    const dateB = b.split("/");
    const dateAObj = new Date(parseInt(dateA[2]), parseInt(dateA[1]) - 1, parseInt(dateA[0]));
    const dateBObj = new Date(parseInt(dateB[2]), parseInt(dateB[1]) - 1, parseInt(dateB[0]));
    return dateBObj.getTime() - dateAObj.getTime(); // Mais recente primeiro
  });

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

      {/* Resumo de exames importantes */}
      {hasSummaryData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-primary" />
                Resumo de Exames Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestGlycemia && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Glicemia</p>
                    <p className="text-lg font-semibold text-white">
                      {latestGlycemia.value} {latestGlycemia.unit}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(latestGlycemia.date)}
                    </p>
                    {latestGlycemia.referenceRange && (
                      <p className="text-xs text-slate-500 mt-1">
                        Ref: {latestGlycemia.referenceRange}
                      </p>
                    )}
                  </div>
                )}
                {latestHbA1c && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">HbA1c</p>
                    <p className="text-lg font-semibold text-white">
                      {latestHbA1c.value} {latestHbA1c.unit}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(latestHbA1c.date)}
                    </p>
                    {latestHbA1c.referenceRange && (
                      <p className="text-xs text-slate-500 mt-1">
                        Ref: {latestHbA1c.referenceRange}
                      </p>
                    )}
                  </div>
                )}
                {latestCT && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Colesterol Total</p>
                    <p className="text-lg font-semibold text-white">
                      {latestCT.value} {latestCT.unit}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(latestCT.date)}
                    </p>
                    {latestCT.referenceRange && (
                      <p className="text-xs text-slate-500 mt-1">
                        Ref: {latestCT.referenceRange}
                      </p>
                    )}
                  </div>
                )}
                {latestHDL && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">HDL</p>
                    <p className="text-lg font-semibold text-white">
                      {latestHDL.value} {latestHDL.unit}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(latestHDL.date)}
                    </p>
                    {latestHDL.referenceRange && (
                      <p className="text-xs text-slate-500 mt-1">
                        Ref: {latestHDL.referenceRange}
                      </p>
                    )}
                  </div>
                )}
                {latestLDL && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">LDL</p>
                    <p className="text-lg font-semibold text-white">
                      {latestLDL.value} {latestLDL.unit}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(latestLDL.date)}
                    </p>
                    {latestLDL.referenceRange && (
                      <p className="text-xs text-slate-500 mt-1">
                        Ref: {latestLDL.referenceRange}
                      </p>
                    )}
                  </div>
                )}
                {latestTG && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Triglicerídeos</p>
                    <p className="text-lg font-semibold text-white">
                      {latestTG.value} {latestTG.unit}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(latestTG.date)}
                    </p>
                    {latestTG.referenceRange && (
                      <p className="text-xs text-slate-500 mt-1">
                        Ref: {latestTG.referenceRange}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Exames Laboratoriais</CardTitle>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Exame
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : labResults.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhum exame laboratorial registrado ainda.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => {
                  const results = groupedResults.get(dateKey)!;
                  return (
                    <motion.div
                      key={dateKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10">
                        {dateKey}
                      </h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10">
                              <TableHead className="text-slate-300">Tipo</TableHead>
                              <TableHead className="text-slate-300">Nome</TableHead>
                              <TableHead className="text-slate-300">Valor</TableHead>
                              <TableHead className="text-slate-300">Unidade</TableHead>
                              <TableHead className="text-slate-300">Referência</TableHead>
                              <TableHead className="text-slate-300">Observações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.map((result) => (
                              <TableRow
                                key={result.id}
                                className="border-white/10 hover:bg-white/5"
                              >
                                <TableCell>
                                  <span className={getTestTypeColor(result.testType)}>
                                    {formatTestType(result.testType)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-white">
                                  {result.name}
                                </TableCell>
                                <TableCell className="text-white font-semibold">
                                  {result.value}
                                </TableCell>
                                <TableCell className="text-white">
                                  {result.unit}
                                </TableCell>
                                <TableCell className="text-slate-400">
                                  {result.referenceRange || "—"}
                                </TableCell>
                                <TableCell className="text-slate-400 max-w-xs truncate">
                                  {result.notes || "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Formulário de criação */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Novo Exame Laboratorial</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <LabResultForm
                onSubmit={(formData) => {
                  handleCreateLabResult(formData);
                }}
                onCancel={() => setShowCreateModal(false)}
                submitting={submitting}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function LabResultForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (data: {
    date: string;
    testType: LabTestType;
    name: string;
    value: number | string;
    unit: string;
    referenceRange?: string | null;
    notes?: string | null;
  }) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    testType: "OTHER" as LabTestType,
    name: "",
    value: "",
    unit: "",
    referenceRange: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parseValue = (value: string): number | string => {
      if (!value || value.trim() === "") return "";
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    };

    onSubmit({
      date: new Date(formData.date).toISOString(),
      testType: formData.testType,
      name: formData.name.trim(),
      value: parseValue(formData.value),
      unit: formData.unit.trim(),
      referenceRange: formData.referenceRange.trim() || null,
      notes: formData.notes.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-slate-300">
            Data *
          </Label>
          <Input
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="bg-white/5 border-white/10 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="testType" className="text-slate-300">
            Tipo de Exame *
          </Label>
          <select
            id="testType"
            value={formData.testType}
            onChange={(e) =>
              setFormData({ ...formData, testType: e.target.value as LabTestType })
            }
            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            {testTypeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">
            Nome do Exame *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: Glicemia de jejum"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit" className="text-slate-300">
            Unidade *
          </Label>
          <Input
            id="unit"
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: mg/dL"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value" className="text-slate-300">
            Valor *
          </Label>
          <Input
            id="value"
            type="text"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: 95 ou <5.7"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referenceRange" className="text-slate-300">
            Faixa de Referência
          </Label>
          <Input
            id="referenceRange"
            type="text"
            value={formData.referenceRange}
            onChange={(e) =>
              setFormData({ ...formData, referenceRange: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: 70-100 mg/dL"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-slate-300">
          Observações
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="bg-white/5 border-white/10 text-white min-h-[100px]"
          placeholder="Observações adicionais sobre o exame..."
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
          className="bg-primary hover:bg-primary/90 text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Criar Exame"
          )}
        </Button>
      </div>
    </form>
  );
}

