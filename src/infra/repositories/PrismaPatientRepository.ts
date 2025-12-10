import type {
  Patient,
  CreatePatientInput,
  UpdatePatientInput,
  PatientListFilters,
} from "@/domain/entities/Patient";
import type { PatientRepository } from "@/domain/repositories/PatientRepository";
import { prisma } from "../database/prisma";

export class PrismaPatientRepository implements PatientRepository {
  async findById(id: string, organizationId: string): Promise<Patient | null> {
    const patient = await prisma.patient.findFirst({
      where: { id, organizationId },
    });

    if (!patient) {
      return null;
    }

    return this.toDomain(patient);
  }

  async listByOrganization(
    organizationId: string,
    filters?: PatientListFilters
  ): Promise<Patient[]> {
    const where: {
      organizationId: string;
      fullName?: { contains: string; mode?: "insensitive" };
      tags?: { hasSome: string[] };
      sex?: string;
    } = {
      organizationId,
    };

    if (filters?.search) {
      where.fullName = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters?.sex) {
      where.sex = filters.sex;
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return patients.map((patient) => this.toDomain(patient));
  }

  async create(data: CreatePatientInput): Promise<Patient> {
    const patient = await prisma.patient.create({
      data: {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        sex: data.sex,
        email: data.email,
        phone: data.phone,
        tags: data.tags ?? [],
        notes: data.notes,
        organizationId: data.organizationId,
      },
    });

    return this.toDomain(patient);
  }

  async update(id: string, data: UpdatePatientInput): Promise<Patient> {
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth }),
        ...(data.sex !== undefined && { sex: data.sex }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.notes !== undefined && { notes: data.notes }),
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
    fullName: string;
    dateOfBirth: Date;
    sex: string;
    email: string | null;
    phone: string | null;
    tags: string[];
    notes: string | null;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Patient {
    return {
      id: patient.id,
      organizationId: patient.organizationId,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      sex: patient.sex as "MALE" | "FEMALE" | "OTHER",
      phone: patient.phone,
      email: patient.email,
      tags: patient.tags,
      notes: patient.notes,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }
}

