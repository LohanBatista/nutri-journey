"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { CheckCircle2, XCircle, Clock, Users, User } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  maxProfessionals: number | null;
  maxPatients: number | null;
  createdAt: string;
}

interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  startDate: string;
  endDate: string | null;
  status: "ACTIVE" | "CANCELLED" | "TRIAL";
  createdAt: string;
  updatedAt: string;
  plan: Plan | null;
}

interface SubscriptionData {
  subscription: OrganizationSubscription | null;
  plan: Plan | null;
  limits: {
    maxProfessionals: number | null;
    maxPatients: number | null;
  };
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
    TRIAL: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return statusMap[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: "Ativo",
    CANCELLED: "Cancelado",
    TRIAL: "Trial",
  };
  return statusMap[status] || status;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "ACTIVE":
      return <CheckCircle2 className="w-4 h-4" />;
    case "CANCELLED":
      return <XCircle className="w-4 h-4" />;
    case "TRIAL":
      return <Clock className="w-4 h-4" />;
  }
}

export default function BillingPage() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/subscription");

        if (!response.ok) {
          throw new Error("Erro ao buscar assinatura");
        }

        const data = await response.json();
        setSubscriptionData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Carregando informações de assinatura...</div>
      </div>
    );
  }

  if (error || !subscriptionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-400">Erro: {error || "Dados não encontrados"}</div>
      </div>
    );
  }

  const { subscription, plan, limits } = subscriptionData;

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-white"
      >
        Assinatura e Cobrança
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Plano Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscription && plan ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-400">{plan.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full border flex items-center gap-2 ${getStatusColor(
                      subscription.status
                    )}`}
                  >
                    {getStatusIcon(subscription.status)}
                    {getStatusLabel(subscription.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Profissionais</p>
                      <p className="text-white font-semibold">
                        {limits.maxProfessionals
                          ? `Até ${limits.maxProfessionals}`
                          : "Ilimitado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Pacientes</p>
                      <p className="text-white font-semibold">
                        {limits.maxPatients ? `Até ${limits.maxPatients}` : "Ilimitado"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-400">Valor Mensal</p>
                      <p className="text-3xl font-bold text-white">
                        {formatPrice(plan.monthlyPriceCents)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Alterar Plano
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-400 mb-2">Período da Assinatura</p>
                  <p className="text-white">
                    {new Date(subscription.startDate).toLocaleDateString("pt-BR")} -{" "}
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString("pt-BR")
                      : "Sem data de término"}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">Nenhuma assinatura ativa encontrada.</p>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Assinar Plano
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Limites e Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-sm text-slate-400">Profissionais</p>
                  <p className="text-white font-semibold">
                    {limits.maxProfessionals
                      ? `Limite: ${limits.maxProfessionals}`
                      : "Sem limite"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-sm text-slate-400">Pacientes</p>
                  <p className="text-white font-semibold">
                    {limits.maxPatients ? `Limite: ${limits.maxPatients}` : "Sem limite"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

