"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import { useSessionStore } from "@/presentation/stores/session-store";
import { ArrowLeft } from "lucide-react";

export default function NewMeetingPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const router = useRouter();
  const { programId } = use(params);
  const { organization } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    topic: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organization?.id) {
      setError("Organização não encontrada");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/programs/${programId}/meetings?organizationId=${organization.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: new Date(formData.date),
            topic: formData.topic,
            notes: formData.notes || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar encontro");
      }

      const result = await response.json();
      router.push(`/app/programs/${programId}/meetings/${result.meeting.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
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
          Novo Encontro
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Informações do Encontro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">
                  Data e Hora *
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-white">
                  Tópico *
                </Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                  placeholder="Ex: Aula sobre alimentação saudável"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                  placeholder="Observações sobre o encontro..."
                />
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
                  {loading ? "Criando..." : "Criar Encontro"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

