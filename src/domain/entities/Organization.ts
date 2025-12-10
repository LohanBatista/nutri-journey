export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationCreateInput {
  name: string;
}

export interface OrganizationUpdateInput {
  name?: string;
}
