import { create } from "zustand";
import type { Professional } from "@/domain/entities/Professional";
import type { Organization } from "@/domain/entities/Organization";

interface SessionState {
  professional: Professional | null;
  organization: Organization | null;
  setSession: (professional: Professional, organization: Organization) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  professional: null,
  organization: null,
  setSession: (professional, organization) =>
    set({ professional, organization }),
  clearSession: () => set({ professional: null, organization: null }),
}));
