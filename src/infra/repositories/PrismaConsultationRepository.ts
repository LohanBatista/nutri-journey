import type {
  Consultation,
  CreateConsultationInput,
  UpdateConsultationInput,
  ConsultationListFilters,
} from "@/domain/entities/Consultation";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";
import { prisma } from "../database/prisma";

export class PrismaConsultationRepository implements ConsultationRepository {
  async findById(
    id: string,
    organizationId: string
  ): Promise<Consultation | null> {
    const consultation = await prisma.consultation.findFirst({
      where: { id, organizationId },
    });

    if (!consultation) {
      return null;
    }

    return this.toDomain(consultation);
  }

  async listByOrganization(
    organizationId: string,
    filters?: ConsultationListFilters
  ): Promise<Consultation[]> {
    const where: {
      organizationId: string;
      patientId?: string;
      professionalId?: string;
      type?: string;
      dateTime?: { gte?: Date; lte?: Date };
    } = {
      organizationId,
    };

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.professionalId) {
      where.professionalId = filters.professionalId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      where.dateTime = {};
      if (filters.startDate) {
        where.dateTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.dateTime.lte = filters.endDate;
      }
    }

    const consultations = await prisma.consultation.findMany({
      where,
      orderBy: { dateTime: "desc" },
    });

    return consultations.map((consultation) => this.toDomain(consultation));
  }

  async create(data: CreateConsultationInput): Promise<Consultation> {
    const consultation = await prisma.consultation.create({
      data: {
        organizationId: data.organizationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        dateTime: data.dateTime,
        type: data.type,
        ...(data.mainComplaint !== undefined && {
          mainComplaint: data.mainComplaint,
        }),
        ...(data.nutritionHistory !== undefined && {
          nutritionHistory: data.nutritionHistory,
        }),
        ...(data.clinicalHistory !== undefined && {
          clinicalHistory: data.clinicalHistory,
        }),
        ...(data.objectiveData !== undefined && {
          objectiveData: data.objectiveData,
        }),
        ...(data.nutritionDiagnosis !== undefined && {
          nutritionDiagnosis: data.nutritionDiagnosis,
        }),
        ...(data.plan !== undefined && { plan: data.plan }),
      },
    });

    return this.toDomain(consultation);
  }

  async update(
    id: string,
    data: UpdateConsultationInput
  ): Promise<Consultation> {
    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        ...(data.dateTime !== undefined && { dateTime: data.dateTime }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.mainComplaint !== undefined && {
          mainComplaint: data.mainComplaint,
        }),
        ...(data.nutritionHistory !== undefined && {
          nutritionHistory: data.nutritionHistory,
        }),
        ...(data.clinicalHistory !== undefined && {
          clinicalHistory: data.clinicalHistory,
        }),
        ...(data.objectiveData !== undefined && {
          objectiveData: data.objectiveData,
        }),
        ...(data.nutritionDiagnosis !== undefined && {
          nutritionDiagnosis: data.nutritionDiagnosis,
        }),
        ...(data.plan !== undefined && { plan: data.plan }),
      },
    });

    return this.toDomain(consultation);
  }

  async delete(id: string): Promise<void> {
    await prisma.consultation.delete({
      where: { id },
    });
  }

  private toDomain(consultation: {
    id: string;
    organizationId: string;
    patientId: string;
    professionalId: string;
    dateTime: Date;
    type: string;
    mainComplaint: string | null;
    nutritionHistory: string | null;
    clinicalHistory: string | null;
    objectiveData: string | null;
    nutritionDiagnosis: string | null;
    plan: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Consultation {
    return {
      id: consultation.id,
      organizationId: consultation.organizationId,
      patientId: consultation.patientId,
      professionalId: consultation.professionalId,
      dateTime: consultation.dateTime,
      type: consultation.type as "INITIAL" | "FOLLOW_UP" | "GROUP" | "HOSPITAL",
      mainComplaint: consultation.mainComplaint,
      nutritionHistory: consultation.nutritionHistory,
      clinicalHistory: consultation.clinicalHistory,
      objectiveData: consultation.objectiveData,
      nutritionDiagnosis: consultation.nutritionDiagnosis,
      plan: consultation.plan,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  }
}
