import type {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
} from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";
import { prisma } from "../database/prisma";

export class PrismaPatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return null;
    }

    return this.toDomain(patient);
  }

  async findByOrganizationId(organizationId: string): Promise<Patient[]> {
    const patients = await prisma.patient.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    return patients.map((patient) => this.toDomain(patient));
  }

  async create(data: PatientCreateInput): Promise<Patient> {
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        birthDate: data.birthDate ?? null,
        organizationId: data.organizationId,
      },
    });

    return this.toDomain(patient);
  }

  async update(id: string, data: PatientUpdateInput): Promise<Patient> {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email ?? null }),
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.birthDate !== undefined && { birthDate: data.birthDate ?? null }),
      },
    });

    return this.toDomain(patient);
  }

  async delete(id: string): Promise<void> {
    await prisma.patient.delete({
      where: { id },
    });
  }

  private toDomain(patient: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    birthDate: Date | null;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Patient {
    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      organizationId: patient.organizationId,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }
}

