import type { Professional, ProfessionalRole } from "./Professional";

export type ProfessionalWithoutPassword = Omit<Professional, "passwordHash">;

