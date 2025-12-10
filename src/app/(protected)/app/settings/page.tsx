"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import { useProfessionalProfile, useOrganizationProfile, useSubscription } from "@/presentation/settings/hooks/useSettings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-white"
      >
        Configurações
      </motion.h1>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProfessionalProfileSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <OrganizationProfileSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SubscriptionSection />
        </motion.div>
      </div>
    </div>
  );
}

function ProfessionalProfileSection() {
  const { profile, loading, error, updateProfile } = useProfessionalProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartEdit = () => {
    if (profile) {
      setFormData({ name: profile.name, password: "" });
      setIsEditing(true);
      setSaveError(null);
      setSaveSuccess(false);
    }
  };

  const handleStartEditPassword = () => {
    setFormData({ name: profile?.name || "", password: "" });
    setIsEditingPassword(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsEditingPassword(false);
    setFormData({ name: "", password: "" });
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const updates: { name?: string; password?: string } = {};
      if (isEditing && formData.name !== profile.name) {
        updates.name = formData.name;
      }
      if (isEditingPassword && formData.password) {
        if (formData.password.length < 6) {
          setSaveError("A senha deve ter pelo menos 6 caracteres");
          setSaving(false);
          return;
        }
        updates.password = formData.password;
      }

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        setIsEditingPassword(false);
        setSaving(false);
        return;
      }

      await updateProfile(updates);
      setSaveSuccess(true);
      setIsEditing(false);
      setIsEditingPassword(false);
      setFormData({ name: "", password: "" });
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Perfil do Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Perfil do Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error || "Erro ao carregar perfil"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Perfil do Profissional</CardTitle>
        <CardDescription className="text-slate-400">
          Gerencie suas informações pessoais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {saveError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            Perfil atualizado com sucesso!
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500">
              O email não pode ser alterado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Nome
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  id="name"
                  value={profile.name}
                  disabled
                  className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                />
                <Button
                  onClick={handleStartEdit}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Alterar Nome
                </Button>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Senha
            </Label>
            {isEditingPassword ? (
              <>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !formData.password}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <Button
                onClick={handleStartEditPassword}
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/10"
              >
                Alterar Senha
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrganizationProfileSection() {
  const { profile, loading, error, updateProfile } = useOrganizationProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartEdit = () => {
    if (profile) {
      setFormData({ name: profile.name });
      setIsEditing(true);
      setSaveError(null);
      setSaveSuccess(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: "" });
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      if (formData.name === profile.name) {
        setIsEditing(false);
        setSaving(false);
        return;
      }

      await updateProfile({ name: formData.name });
      setSaveSuccess(true);
      setIsEditing(false);
      setFormData({ name: "" });
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error || "Erro ao carregar organização"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Organização</CardTitle>
        <CardDescription className="text-slate-400">
          Gerencie as informações da sua organização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {saveError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            Organização atualizada com sucesso!
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-white">
              Nome da Organização
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="org-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !formData.name.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  id="org-name"
                  value={profile.name}
                  disabled
                  className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                />
                <Button
                  onClick={handleStartEdit}
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Alterar Nome
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionSection() {
  const { subscriptionData, loading, error } = useSubscription();

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Plano e Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Plano e Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionData) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Plano e Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Nenhuma assinatura encontrada</p>
        </CardContent>
      </Card>
    );
  }

  const { subscription, plan, limits } = subscriptionData;
  const statusLabels: Record<string, string> = {
    ACTIVE: "Ativo",
    TRIAL: "Trial",
    CANCELLED: "Cancelado",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500/10 border-green-500/20 text-green-400",
    TRIAL: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    CANCELLED: "bg-red-500/10 border-red-500/20 text-red-400",
  };

  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-white">Plano e Assinatura</CardTitle>
        <CardDescription className="text-slate-400">
          Informações sobre seu plano atual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  statusColors[subscription.status] || statusColors.TRIAL
                }`}
              >
                {statusLabels[subscription.status] || subscription.status}
              </span>
            </div>

            {plan && (
              <>
                <div className="space-y-2">
                  <span className="text-slate-400">Plano:</span>
                  <p className="text-white font-semibold">{plan.name}</p>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-400">Preço:</span>
                  <p className="text-white font-semibold">
                    R$ {(plan.monthlyPriceCents / 100).toFixed(2)}/mês
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-400">Limites:</span>
                  <div className="space-y-1 text-sm">
                    <p className="text-white">
                      Profissionais:{" "}
                      <span className="text-slate-400">
                        {limits.maxProfessionals
                          ? limits.maxProfessionals
                          : "Ilimitado"}
                      </span>
                    </p>
                    <p className="text-white">
                      Pacientes:{" "}
                      <span className="text-slate-400">
                        {limits.maxPatients
                          ? limits.maxPatients
                          : "Ilimitado"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-400">Data de Início:</span>
                  <p className="text-white">
                    {new Date(subscription.startDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                {subscription.endDate && (
                  <div className="space-y-2">
                    <span className="text-slate-400">Data de Término:</span>
                    <p className="text-white">
                      {new Date(subscription.endDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </>
            )}

            {!plan && (
              <p className="text-slate-400">
                Informações do plano não disponíveis
              </p>
            )}
          </div>
        )}

        {!subscription && (
          <p className="text-slate-400">Nenhuma assinatura ativa encontrada</p>
        )}
      </CardContent>
    </Card>
  );
}
