"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import { useCreateProgram } from "@/presentation/programs/hooks";
import { ArrowLeft } from "lucide-react";

export default function NewProgramPage() {
  const router = useRouter();
  const { createProgram, loading, error } = useCreateProgram();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "PLANNED" as "PLANNED" | "ACTIVE" | "FINISHED",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProgram({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        status: formData.status,
      });
    } catch (err) {
      console.error("Erro ao criar programa:", err);
    }
  };

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
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Novo Programa
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Informações do Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nome do Programa *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                  placeholder="Ex: Grupo de Emagrecimento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Descrição *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                  placeholder="Descreva o objetivo e características do programa..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-white">
                    Data de Início
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-white">
                    Data de Término
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">
                  Status Inicial
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "PLANNED" | "ACTIVE" | "FINISHED",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="PLANNED">Planejado</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="FINISHED">Finalizado</option>
                </select>
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {loading ? "Criando..." : "Criar Programa"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

