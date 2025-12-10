"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";
import { useSessionStore } from "@/presentation/stores/session-store";
import { ArrowLeft, Save } from "lucide-react";
import type { ProgramMeetingRecord } from "@/domain/entities/Program";
import type { Patient } from "@/domain/entities/Patient";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MeetingRecordPage({
  params,
}: {
  params: Promise<{ programId: string; meetingId: string }>;
}) {
  const router = useRouter();
  const { programId, meetingId } = use(params);
  const { organization } = useSessionStore();
  const [meeting, setMeeting] = useState<any>(null);
  const [participants, setParticipants] = useState<
    (Patient & { record?: ProgramMeetingRecord })[]
  >([]);
  const [records, setRecords] = useState<
    Record<string, Partial<ProgramMeetingRecord>>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!organization?.id) return;

      try {
        setLoading(true);

        // Buscar programa e participantes
        const programResponse = await fetch(
          `/api/programs/${programId}?organizationId=${organization.id}`
        );
        const programData = await programResponse.json();

        // Buscar encontro
        const meetingResponse = await fetch(
          `/api/programs/${programId}/meetings`
        );
        const meetingsData = await meetingResponse.json();
        const foundMeeting = meetingsData.meetings.find(
          (m: any) => m.id === meetingId
        );
        setMeeting(foundMeeting);

        // Buscar registros existentes
        const recordsResponse = await fetch(
          `/api/programs/${programId}/meetings/${meetingId}/records`
        );
        const recordsData = await recordsResponse.json();

        // Buscar dados dos participantes
        const participantsWithRecords = await Promise.all(
          (programData.program?.participants || []).map(
            async (p: any) => {
              const patientResponse = await fetch(
                `/api/patients/${p.patientId}?organizationId=${organization.id}`
              );
              const patientData = await patientResponse.json();
              const existingRecord = recordsData.records?.find(
                (r: ProgramMeetingRecord) => r.patientId === p.patientId
              );

              return {
                ...patientData.patient,
                record: existingRecord,
              };
            }
          )
        );

        setParticipants(participantsWithRecords);

        // Inicializar records com dados existentes
        const initialRecords: Record<string, Partial<ProgramMeetingRecord>> = {};
        participantsWithRecords.forEach((p) => {
          if (p.record) {
            initialRecords[p.id] = {
              presence: p.record.presence,
              weightKg: p.record.weightKg,
              bmi: p.record.bmi,
              bloodPressureSystolic: p.record.bloodPressureSystolic,
              bloodPressureDiastolic: p.record.bloodPressureDiastolic,
              notes: p.record.notes,
            };
          } else {
            initialRecords[p.id] = {
              presence: false,
              weightKg: null,
              bmi: null,
              bloodPressureSystolic: null,
              bloodPressureDiastolic: null,
              notes: null,
            };
          }
        });
        setRecords(initialRecords);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [programId, meetingId, organization?.id]);

  const updateRecord = (
    patientId: string,
    field: keyof ProgramMeetingRecord,
    value: any
  ) => {
    setRecords((prev) => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!organization?.id) return;

    try {
      setSaving(true);

      await Promise.all(
        participants.map(async (participant) => {
          const record = records[participant.id];
          if (!record) return;

          await fetch(
            `/api/programs/${programId}/meetings/${meetingId}/records`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                patientId: participant.id,
                presence: record.presence ?? false,
                weightKg: record.weightKg ? Number(record.weightKg) : null,
                bmi: record.bmi ? Number(record.bmi) : null,
                bloodPressureSystolic: record.bloodPressureSystolic
                  ? Number(record.bloodPressureSystolic)
                  : null,
                bloodPressureDiastolic: record.bloodPressureDiastolic
                  ? Number(record.bloodPressureDiastolic)
                  : null,
                notes: record.notes || null,
              }),
            }
          );
        })
      );

      router.push(`/app/programs/${programId}`);
    } catch (error) {
      console.error("Erro ao salvar registros:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <h1 className="text-3xl font-bold text-white">
            {meeting?.topic || "Registro de Encontro"}
          </h1>
          <p className="text-slate-400 mt-1">
            {formatDate(meeting?.date)}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Registros de Participantes</CardTitle>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Todos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Nenhum participante no programa.
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white">Participante</TableHead>
                      <TableHead className="text-white">Presença</TableHead>
                      <TableHead className="text-white">Peso (kg)</TableHead>
                      <TableHead className="text-white">IMC</TableHead>
                      <TableHead className="text-white">PA Sistólica</TableHead>
                      <TableHead className="text-white">PA Diastólica</TableHead>
                      <TableHead className="text-white">Notas</TableHead>
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
                          {participant.fullName}
                        </TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={records[participant.id]?.presence ?? false}
                            onChange={(e) =>
                              updateRecord(participant.id, "presence", e.target.checked)
                            }
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={records[participant.id]?.weightKg ?? ""}
                            onChange={(e) =>
                              updateRecord(
                                participant.id,
                                "weightKg",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                            className="w-20 bg-white/5 border-white/10 text-white"
                            placeholder="kg"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            value={records[participant.id]?.bmi ?? ""}
                            onChange={(e) =>
                              updateRecord(
                                participant.id,
                                "bmi",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                            className="w-20 bg-white/5 border-white/10 text-white"
                            placeholder="IMC"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={records[participant.id]?.bloodPressureSystolic ?? ""}
                            onChange={(e) =>
                              updateRecord(
                                participant.id,
                                "bloodPressureSystolic",
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="w-20 bg-white/5 border-white/10 text-white"
                            placeholder="mmHg"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={records[participant.id]?.bloodPressureDiastolic ?? ""}
                            onChange={(e) =>
                              updateRecord(
                                participant.id,
                                "bloodPressureDiastolic",
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="w-20 bg-white/5 border-white/10 text-white"
                            placeholder="mmHg"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={records[participant.id]?.notes ?? ""}
                            onChange={(e) =>
                              updateRecord(participant.id, "notes", e.target.value)
                            }
                            className="w-40 bg-white/5 border-white/10 text-white"
                            placeholder="Notas..."
                          />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

