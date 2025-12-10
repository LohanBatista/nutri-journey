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
import { usePrograms } from "@/presentation/programs/hooks";
import { Plus, Search } from "lucide-react";
import type { ProgramListFilters } from "@/domain/entities/Program";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatStatus(status: string): string {
  const statusMap: Record<string, { label: string; color: string }> = {
    PLANNED: { label: "Planejado", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    ACTIVE: { label: "Ativo", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    FINISHED: { label: "Finalizado", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  };
  return statusMap[status]?.label || status;
}

function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    PLANNED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    FINISHED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return statusMap[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export default function ProgramsPage() {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"PLANNED" | "ACTIVE" | "FINISHED" | undefined>(undefined);
  const [filters, setFilters] = useState<ProgramListFilters>({});

  const { programs, loading, error } = usePrograms(filters);

  const handleSearch = (value: string): void => {
    setSearch(value);
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value.trim()) {
        newFilters.search = value;
      } else {
        delete newFilters.search;
      }
      return newFilters;
    });
  };

  const handleStatusFilter = (status: "PLANNED" | "ACTIVE" | "FINISHED" | undefined): void => {
    setStatusFilter(status);
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (status) {
        newFilters.status = status;
      } else {
        delete newFilters.status;
      }
      return newFilters;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Programas/Grupos
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={() => router.push("/app/programs/new")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Programa
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
            <CardTitle className="text-white">Lista de Programas</CardTitle>
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
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(undefined)}
                  className={statusFilter === undefined ? "bg-primary text-white" : "bg-white/5 border-white/10 text-white"}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "PLANNED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter("PLANNED")}
                  className={statusFilter === "PLANNED" ? "bg-primary text-white" : "bg-white/5 border-white/10 text-white"}
                >
                  Planejados
                </Button>
                <Button
                  variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter("ACTIVE")}
                  className={statusFilter === "ACTIVE" ? "bg-primary text-white" : "bg-white/5 border-white/10 text-white"}
                >
                  Ativos
                </Button>
                <Button
                  variant={statusFilter === "FINISHED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter("FINISHED")}
                  className={statusFilter === "FINISHED" ? "bg-primary text-white" : "bg-white/5 border-white/10 text-white"}
                >
                  Finalizados
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8 text-slate-400">
                Carregando programas...
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-400">
                Erro: {error}
              </div>
            )}

            {!loading && !error && programs.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                Nenhum programa encontrado.
              </div>
            )}

            {!loading && !error && programs.length > 0 && (
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white">Nome</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Período</TableHead>
                      <TableHead className="text-white">Participantes</TableHead>
                      <TableHead className="text-white">Encontros</TableHead>
                      <TableHead className="text-white">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.map((program, index) => (
                      <motion.tr
                        key={program.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() => router.push(`/app/programs/${program.id}`)}
                      >
                        <TableCell className="text-white font-medium">
                          {program.name}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <span
                            className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(program.status)}`}
                          >
                            {formatStatus(program.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatDate(program.startDate)} - {formatDate(program.endDate)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {program.participants?.length || 0}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {program.meetings?.length || 0}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/app/programs/${program.id}`);
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
