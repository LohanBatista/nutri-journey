export interface Professional {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalCreateInput {
  name: string;
  email: string;
  passwordHash: string;
  organizationId: string;
}

export interface ProfessionalUpdateInput {
  name?: string;
  email?: string;
  passwordHash?: string;
}
