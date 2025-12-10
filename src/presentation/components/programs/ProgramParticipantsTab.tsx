"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useSessionStore } from "@/presentation/stores/session-store";
import { usePatients } from "@/presentation/patients/hooks/usePatients";
import { Plus, X } from "lucide-react";
import type { ProgramParticipant } from "@/domain/entities/Program";
import type { Patient } from "@/domain/entities/Patient";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR");
}

interface ProgramParticipantsTabProps {
  programId: string;
  onUpdate: () => void;
}

export function ProgramParticipantsTab({
  programId,
  onUpdate,
}: ProgramParticipantsTabProps) {
  const router = useRouter();
  const { organization } = useSessionStore();
  const [participants, setParticipants] = useState<
    (ProgramParticipant & { patient?: Patient })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const { patients } = usePatients({});

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!organization?.id) return;

      try {
        setLoading(true);
        const program = await fetch(
          `/api/programs/${programId}?organizationId=${organization.id}`
        ).then((res) => res.json());

        if (program.program?.participants) {
          // Buscar dados dos pacientes
          const participantsWithPatients = await Promise.all(
            program.program.participants.map(async (p: ProgramParticipant) => {
              const patientResponse = await fetch(
                `/api/patients/${p.patientId}?organizationId=${organization.id}`
              );
              const patientData = await patientResponse.json();
              return { ...p, patient: patientData.patient };
            })
          );
          setParticipants(participantsWithPatients);
        }
      } catch (error) {
        console.error("Erro ao carregar participantes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [programId, organization?.id, onUpdate]);

  const handleAddParticipant = async () => {
    if (!selectedPatientId || !organization?.id) return;

    try {
      const response = await fetch(
        `/api/programs/${programId}/participants?organizationId=${organization.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: selectedPatientId }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao adicionar participante");
      }

      setShowAddForm(false);
      setSelectedPatientId("");
      onUpdate();
    } catch (error) {
      console.error("Erro ao adicionar participante:", error);
    }
  };

  const handleRemoveParticipant = async (patientId: string) => {
    if (!organization?.id) return;

    if (!confirm("Tem certeza que deseja remover este participante?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/programs/${programId}/participants?organizationId=${organization.id}&patientId=${patientId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao remover participante");
      }

      onUpdate();
    } catch (error) {
      console.error("Erro ao remover participante:", error);
    }
  };

  const availablePatients = patients.filter(
    (p) => !participants.some((part) => part.patientId === p.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CardTitle className="text-white">Participantes do Programa</CardTitle>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Participante
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Adicionar Participante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Selecionar Paciente
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2"
              >
                <option value="">Selecione um paciente...</option>
                {availablePatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddParticipant}
                disabled={!selectedPatientId}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Adicionar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedPatientId("");
                }}
                className="bg-white/5 border-white/10 text-white"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/5 backdrop-blur-md border border-white/10">
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">
              Carregando participantes...
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum participante adicionado ainda.
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white">Nome</TableHead>
                    <TableHead className="text-white">Data de Ingresso</TableHead>
                    <TableHead className="text-white">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant, index) => (
                    <motion.tr
                      key={participant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="text-white font-medium">
                        {participant.patient?.fullName || "Carregando..."}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {formatDate(participant.joinDate)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participant.patientId)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

