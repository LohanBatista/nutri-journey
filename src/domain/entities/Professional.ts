export type ProfessionalRole = "ADMIN" | "PROFESSIONAL";

export interface Professional {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  role: ProfessionalRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalCreateInput {
  name: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  role: ProfessionalRole;
}

export interface ProfessionalUpdateInput {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: ProfessionalRole;
}
