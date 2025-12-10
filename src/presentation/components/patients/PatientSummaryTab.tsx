"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSessionStore } from "../../stores/session-store";

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
}

interface Consultation {
  id: string;
  dateTime: string;
  type: "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL";
  mainComplaint: string | null;
}

interface LabResult {
  id: string;
  date: string;
  testType: "GLYCEMIA" | "HBA1C" | "CT" | "HDL" | "LDL" | "TG" | "OTHER";
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string | null;
}

interface PatientSummaryTabProps {
  patientId: string;
}

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

function formatConsultationType(type: string): string {
  const typeMap: Record<string, string> = {
    INITIAL: "Consulta Inicial",
    FOLLOW_UP: "Retorno",
    GROUP: "Grupo",
    HOSPITAL: "Hospitalar",
  };
  return typeMap[type] || type;
}

function formatNumber(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(decimals);
}

function formatTestType(testType: string): string {
  const typeMap: Record<string, string> = {
    GLYCEMIA: "Glicemia",
    HBA1C: "HbA1c",
    CT: "Colesterol Total",
    HDL: "HDL",
    LDL: "LDL",
    TG: "Triglicerídeos",
    OTHER: "Outro",
  };
  return typeMap[testType] || testType;
}

export function PatientSummaryTab({ patientId }: PatientSummaryTabProps) {
  const { organization } = useSessionStore();
  const [anthropometryRecord, setAnthropometryRecord] = useState<AnthropometryRecord | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!organization) return;

    setLoading(true);
    try {
      // Buscar última antropometria
      const anthropometryResponse = await fetch(
        `/api/patients/${patientId}/anthropometry?organizationId=${organization.id}`
      );
      if (anthropometryResponse.ok) {
        const anthropometryData = await anthropometryResponse.json();
        if (anthropometryData.records && anthropometryData.records.length > 0) {
          setAnthropometryRecord(anthropometryData.records[0]);
        }
      }

      // Buscar últimos exames
      const labResultsResponse = await fetch(
        `/api/patients/${patientId}/lab-results?organizationId=${organization.id}`
      );
      if (labResultsResponse.ok) {
        const labResultsData = await labResultsResponse.json();
        if (labResultsData.labResults) {
          setLabResults(labResultsData.labResults.slice(0, 5)); // Últimos 5
        }
      }

      // Buscar últimas consultas
      const consultationsResponse = await fetch(
        `/api/patients/${patientId}/consultations?organizationId=${organization.id}`
      );
      if (consultationsResponse.ok) {
        const consultationsData = await consultationsResponse.json();
        if (consultationsData.consultations) {
          setConsultations(consultationsData.consultations.slice(0, 3)); // Últimas 3
        }
      }
    } catch (error) {
      console.error("Erro ao carregar resumo:", error);
    } finally {
      setLoading(false);
    }
  }, [patientId, organization]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="mb-4 text-slate-400">Últimos registros do paciente:</p>
      <div className="space-y-4">
        {/* Última Antropometria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-white/5 border border-white/10"
        >
          <p className="text-sm text-slate-400 mb-2">Última Antropometria</p>
          {anthropometryRecord ? (
            <div className="space-y-1">
              <p className="text-white">
                <span className="text-slate-400">Data: </span>
                {formatDate(anthropometryRecord.date)}
              </p>
              {anthropometryRecord.weightKg && (
                <p className="text-white">
                  <span className="text-slate-400">Peso: </span>
                  {formatNumber(anthropometryRecord.weightKg, 1)} kg
                </p>
              )}
              {anthropometryRecord.heightM && (
                <p className="text-white">
                  <span className="text-slate-400">Altura: </span>
                  {formatNumber(anthropometryRecord.heightM, 2)} m
                </p>
              )}
              {anthropometryRecord.bmi && (
                <p className="text-white">
                  <span className="text-slate-400">IMC: </span>
                  {formatNumber(anthropometryRecord.bmi)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-white">Nenhum registro encontrado</p>
          )}
        </motion.div>

        {/* Últimos Exames */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-white/5 border border-white/10"
        >
          <p className="text-sm text-slate-400 mb-2">Últimos Exames</p>
          {labResults.length > 0 ? (
            <div className="space-y-2">
              {labResults.map((labResult) => (
                <div key={labResult.id} className="border-t border-white/10 pt-2 first:border-t-0 first:pt-0">
                  <p className="text-white">
                    <span className="text-slate-400">
                      {formatTestType(labResult.testType)} ({labResult.name}):{" "}
                    </span>
                    {labResult.value} {labResult.unit}
                    {labResult.referenceRange && (
                      <span className="text-slate-500 text-sm ml-2">
                        (Ref: {labResult.referenceRange})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(labResult.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white">Nenhum exame encontrado</p>
          )}
        </motion.div>

        {/* Últimas Consultas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-white/5 border border-white/10"
        >
          <p className="text-sm text-slate-400 mb-2">Últimas Consultas</p>
          {consultations.length > 0 ? (
            <div className="space-y-2">
              {consultations.map((consultation) => (
                <div key={consultation.id} className="border-t border-white/10 pt-2 first:border-t-0 first:pt-0">
                  <p className="text-white">
                    <span className="text-slate-400">
                      {formatConsultationType(consultation.type)}:{" "}
                    </span>
                    {formatDateTime(consultation.dateTime)}
                  </p>
                  {consultation.mainComplaint && (
                    <p className="text-sm text-slate-300 mt-1 truncate">
                      {consultation.mainComplaint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white">Nenhuma consulta encontrada</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

