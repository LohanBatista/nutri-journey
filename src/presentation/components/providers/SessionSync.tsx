"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/presentation/stores/session-store";
import type { Professional } from "@/domain/entities/Professional";
import type { Organization } from "@/domain/entities/Organization";

export function SessionSync() {
  const { data: session, status } = useSession();
  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.professional &&
      session?.organization
    ) {
      // Converter ProfessionalWithoutPassword para Professional
      // Como não temos passwordHash na sessão, vamos criar um Professional sem ele
      const professional: Professional = {
        id: session.professional.id,
        name: session.professional.name,
        email: session.professional.email,
        passwordHash: "", // Não é necessário para o store, mas mantém a compatibilidade
        organizationId: session.professional.organizationId,
        role: session.professional.role,
        createdAt: session.professional.createdAt,
        updatedAt: session.professional.updatedAt,
      };

      const organization: Organization = session.organization;

      setSession(professional, organization);
    } else if (status === "unauthenticated") {
      clearSession();
    }
  }, [session, status, setSession, clearSession]);

  return null;
}
