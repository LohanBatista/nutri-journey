export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPriceCents: number;
  maxProfessionals: number | null;
  maxPatients: number | null;
  createdAt: Date;
}

