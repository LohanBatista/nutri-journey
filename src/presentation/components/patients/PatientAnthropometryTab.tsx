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
  TrendingUp,
  TrendingDown,
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

interface AnthropometryRecord {
  id: string;
  date: string;
  weightKg: number | null;
  heightM: number | null;
  bmi: number | null;
  waistCircumference: number | null;
  hipCircumference: number | null;
  armCircumference: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PatientAnthropometryTabProps {
  patientId: string;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatNumber(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}

function calculateVariation(
  current: number | null,
  previous: number | null
): { value: number; isPositive: boolean } | null {
  if (current === null || previous === null) return null;
  const diff = current - previous;
  return {
    value: Math.abs(diff),
    isPositive: diff >= 0,
  };
}

export function PatientAnthropometryTab({
  patientId,
}: PatientAnthropometryTabProps) {
  const { organization, professional } = useSessionStore();
  const [records, setRecords] = useState<AnthropometryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!organization) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/patients/${patientId}/anthropometry?organizationId=${organization.id}`
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar registros antropométricos");
      }

      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [patientId, organization]);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  const handleCreateRecord = async (formData: {
    date: string;
    weightKg?: number | null;
    heightM?: number | null;
    waistCircumference?: number | null;
    hipCircumference?: number | null;
    armCircumference?: number | null;
    notes?: string | null;
  }) => {
    if (!organization || !professional) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/patients/${patientId}/anthropometry`,
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
        throw new Error(errorData.error || "Erro ao criar registro");
      }

      setShowCreateModal(false);
      await fetchRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar registro");
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

  const latestRecord = records[0] || null;
  const previousRecord = records[1] || null;

  const weightVariation = calculateVariation(
    latestRecord?.weightKg ?? null,
    previousRecord?.weightKg ?? null
  );
  const bmiVariation = calculateVariation(
    latestRecord?.bmi ?? null,
    previousRecord?.bmi ?? null
  );

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

      {/* Resumo */}
      {latestRecord && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Última Medição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Peso</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-white">
                      {formatNumber(latestRecord.weightKg, 1)} kg
                    </p>
                    {weightVariation && (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          weightVariation.isPositive
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {weightVariation.isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatNumber(weightVariation.value, 1)} kg
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">IMC</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-white">
                      {formatNumber(latestRecord.bmi)}
                    </p>
                    {bmiVariation && (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          bmiVariation.isPositive
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {bmiVariation.isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {formatNumber(bmiVariation.value)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Data</p>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(latestRecord.date)}
                  </p>
                </div>
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
              <CardTitle className="text-white">Registros Antropométricos</CardTitle>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Registro
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>Nenhum registro antropométrico registrado ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300">Peso (kg)</TableHead>
                      <TableHead className="text-slate-300">Altura (m)</TableHead>
                      <TableHead className="text-slate-300">IMC</TableHead>
                      <TableHead className="text-slate-300">Cintura (cm)</TableHead>
                      <TableHead className="text-slate-300">Quadril (cm)</TableHead>
                      <TableHead className="text-slate-300">Braço (cm)</TableHead>
                      <TableHead className="text-slate-300">Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow
                        key={record.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="text-white">
                          {formatDate(record.date)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatNumber(record.weightKg, 1)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatNumber(record.heightM, 2)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatNumber(record.bmi)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatNumber(record.waistCircumference, 1)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatNumber(record.hipCircumference, 1)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatNumber(record.armCircumference, 1)}
                        </TableCell>
                        <TableCell className="text-white max-w-xs truncate">
                          {record.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <CardTitle className="text-white">Novo Registro Antropométrico</CardTitle>
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
              <AnthropometryForm
                onSubmit={(formData) => {
                  handleCreateRecord(formData);
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

function AnthropometryForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (data: {
    date: string;
    weightKg?: number | null;
    heightM?: number | null;
    waistCircumference?: number | null;
    hipCircumference?: number | null;
    armCircumference?: number | null;
    notes?: string | null;
  }) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    weightKg: "",
    heightM: "",
    waistCircumference: "",
    hipCircumference: "",
    armCircumference: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parseNumber = (value: string): number | null => {
      if (!value || value.trim() === "") return null;
      const parsed = parseFloat(value);
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    };

    // Converter altura de cm para m se necessário (valores > 3 são provavelmente em cm)
    let heightM = parseNumber(formData.heightM);
    if (heightM !== null && heightM > 3) {
      heightM = heightM / 100; // Converter cm para m
    }

    onSubmit({
      date: new Date(formData.date).toISOString(),
      weightKg: parseNumber(formData.weightKg),
      heightM: heightM,
      waistCircumference: parseNumber(formData.waistCircumference),
      hipCircumference: parseNumber(formData.hipCircumference),
      armCircumference: parseNumber(formData.armCircumference),
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
          <Label htmlFor="weightKg" className="text-slate-300">
            Peso (kg)
          </Label>
          <Input
            id="weightKg"
            type="number"
            step="0.1"
            min="0"
            value={formData.weightKg}
            onChange={(e) =>
              setFormData({ ...formData, weightKg: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: 70.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="heightM" className="text-slate-300">
            Altura (m ou cm)
          </Label>
          <Input
            id="heightM"
            type="number"
            step="0.01"
            min="0"
            value={formData.heightM}
            onChange={(e) =>
              setFormData({ ...formData, heightM: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: 1.75 (m) ou 175 (cm)"
          />
          <p className="text-xs text-slate-400">
            Digite em metros (ex: 1.75) ou centímetros (ex: 175)
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="waistCircumference" className="text-slate-300">
            Circunferência da Cintura (cm)
          </Label>
          <Input
            id="waistCircumference"
            type="number"
            step="0.1"
            min="0"
            value={formData.waistCircumference}
            onChange={(e) =>
              setFormData({
                ...formData,
                waistCircumference: e.target.value,
              })
            }
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: 85.0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hipCircumference" className="text-slate-300">
            Circunferência do Quadril (cm)
          </Label>
          <Input
            id="hipCircumference"
            type="number"
            step="0.1"
            min="0"
            value={formData.hipCircumference}
            onChange={(e) =>
              setFormData({ ...formData, hipCircumference: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: 95.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="armCircumference" className="text-slate-300">
            Circunferência do Braço (cm)
          </Label>
          <Input
            id="armCircumference"
            type="number"
            step="0.1"
            min="0"
            value={formData.armCircumference}
            onChange={(e) =>
              setFormData({ ...formData, armCircumference: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white"
            placeholder="Ex: 30.0"
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
          placeholder="Observações adicionais sobre a medição..."
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
            "Criar Registro"
          )}
        </Button>
      </div>
    </form>
  );
}

