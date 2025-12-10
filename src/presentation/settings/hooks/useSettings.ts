import { useState, useEffect } from "react";

interface ProfessionalProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROFESSIONAL";
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

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

export function useProfessionalProfile() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/settings/profile");
      if (!response.ok) {
        throw new Error("Erro ao carregar perfil");
      }
      const data = await response.json();
      setProfile(data.professional);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { name?: string; password?: string }) => {
    try {
      setError(null);
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar perfil");
      }
      const data = await response.json();
      setProfile(data.professional);
      return data.professional;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}

export function useOrganizationProfile() {
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/settings/organization");
      if (!response.ok) {
        throw new Error("Erro ao carregar organização");
      }
      const data = await response.json();
      setProfile(data.organization);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { name?: string }) => {
    try {
      setError(null);
      const response = await fetch("/api/settings/organization", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar organização");
      }
      const data = await response.json();
      setProfile(data.organization);
      return data.organization;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}

export function useSubscription() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/settings/subscription");
      if (!response.ok) {
        throw new Error("Erro ao carregar assinatura");
      }
      const data = await response.json();
      setSubscriptionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    subscriptionData,
    loading,
    error,
    refetch: fetchSubscription,
  };
}

