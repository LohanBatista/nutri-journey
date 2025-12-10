"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { usePatients } from "@/presentation/patients/hooks/usePatients";

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    patientId?: string | null;
    programId?: string;
  }) => void;
  patientId?: string;
  patientName?: string;
}

export function CreateTaskModal({
  onClose,
  onCreate,
  patientId: initialPatientId,
  patientName: initialPatientName,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    initialPatientId ?? null
  );
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientSelect, setShowPatientSelect] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Buscar pacientes quando o dropdown estiver aberto
  // Se houver busca, usa o filtro do hook, senão carrega todos
  const { patients, loading: patientsLoading } = usePatients(
    showPatientSelect && patientSearch.length > 0 ? { search: patientSearch } : undefined
  );

  // Filtrar pacientes baseado na busca local (para melhorar performance quando não há busca no hook)
  const filteredPatients = patientSearch && showPatientSelect
    ? patients.filter((patient) =>
        patient.fullName.toLowerCase().includes(patientSearch.toLowerCase())
      )
    : patients;

  const selectedPatient = selectedPatientId
    ? patients.find((p) => p.id === selectedPatientId)
    : null;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowPatientSelect(false);
      }
    };

    if (showPatientSelect) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPatientSelect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data: {
      title: string;
      description?: string;
      dueDate?: string;
      patientId?: string | null;
    } = {
      title: title.trim(),
    };

    const trimmedDescription = description.trim();
    if (trimmedDescription) {
      data.description = trimmedDescription;
    }

    if (dueDate) {
      data.dueDate = dueDate;
    }

    if (selectedPatientId) {
      data.patientId = selectedPatientId;
    } else {
      data.patientId = null;
    }

    onCreate(data);

    setTitle("");
    setDescription("");
    setDueDate("");
    setSelectedPatientId(initialPatientId ?? null);
    setPatientSearch("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Nova Tarefa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Título *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Descrição
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="patient" className="block text-sm font-medium text-slate-300 mb-2">
              Paciente {initialPatientId && "(pré-selecionado)"}
            </Label>
            {initialPatientId && initialPatientName ? (
              <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                {initialPatientName}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative" ref={selectRef}>
                  <Input
                    id="patient-search"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientSelect(true);
                    }}
                    onFocus={() => setShowPatientSelect(true)}
                    placeholder="Buscar paciente (opcional)"
                    className="bg-white/5 border-white/10 text-white"
                  />
                  {showPatientSelect && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {patientsLoading ? (
                        <div className="p-3 text-slate-400 text-sm">Carregando...</div>
                      ) : filteredPatients.length === 0 ? (
                        <div className="p-3 text-slate-400 text-sm">
                          {patientSearch ? "Nenhum paciente encontrado" : "Digite para buscar pacientes"}
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatientId(null);
                              setShowPatientSelect(false);
                              setPatientSearch("");
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 border-b border-white/10"
                          >
                            Nenhum paciente
                          </button>
                          {filteredPatients.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(patient.id);
                                setShowPatientSelect(false);
                                setPatientSearch(patient.fullName);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${
                                selectedPatientId === patient.id
                                  ? "bg-primary/20 text-primary"
                                  : "text-white"
                              }`}
                            >
                              {patient.fullName}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                {selectedPatient && (
                  <div className="text-xs text-slate-400">
                    Selecionado: {selectedPatient.fullName}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-2">
              Data de Vencimento
            </Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                setShowPatientSelect(false);
              }}
              className="bg-white/5 border-white/10 text-white"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
              Criar
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

