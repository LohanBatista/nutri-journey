"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { usePatients } from "@/presentation/patients/hooks/usePatients";
import { Plus, Search } from "lucide-react";
import type { PatientListFilters } from "@/domain/entities/Patient";

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatSex(sex: string): string {
  const sexMap: Record<string, string> = {
    MALE: "Masculino",
    FEMALE: "Feminino",
    OTHER: "Outro",
  };
  return sexMap[sex] || sex;
}

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState<PatientListFilters>({});

  const { patients, loading, error } = usePatients(filters);

  const handleSearch = (value: string): void => {
    setSearch(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Pacientes
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={() => router.push("/app/patients/new")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Lista de Pacientes</CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8 text-slate-400">
                Carregando pacientes...
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-400">
                Erro: {error}
              </div>
            )}

            {!loading && !error && patients.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                Nenhum paciente encontrado.
              </div>
            )}

            {!loading && !error && patients.length > 0 && (
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white">Nome</TableHead>
                      <TableHead className="text-white">Idade</TableHead>
                      <TableHead className="text-white">Sexo</TableHead>
                      <TableHead className="text-white">Tags</TableHead>
                      <TableHead className="text-white">Última Consulta</TableHead>
                      <TableHead className="text-white">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() => router.push(`/app/patients/${patient.id}`)}
                      >
                        <TableCell className="text-white font-medium">
                          {patient.fullName}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {calculateAge(patient.dateOfBirth)} anos
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatSex(patient.sex)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex flex-wrap gap-1">
                            {patient.tags.length > 0 ? (
                              patient.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/30"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatDate(patient.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/app/patients/${patient.id}`);
                            }}
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                          >
                            Ver Detalhes
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
      </motion.div>
    </div>
  );
}
