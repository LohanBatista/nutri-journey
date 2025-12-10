import type {
  Consultation,
  ConsultationCreateInput,
  ConsultationUpdateInput,
} from "@/domain/entities/Consultation";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";
import { prisma } from "../database/prisma";

export class PrismaConsultationRepository implements ConsultationRepository {
  async findById(id: string): Promise<Consultation | null> {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      return null;
    }

    return this.toDomain(consultation);
  }

  async findByPatientId(patientId: string): Promise<Consultation[]> {
    const consultations = await prisma.consultation.findMany({
      where: { patientId },
      orderBy: { date: "desc" },
    });

    return consultations.map((consultation) => this.toDomain(consultation));
  }

  async findByProfessionalId(professionalId: string): Promise<Consultation[]> {
    const consultations = await prisma.consultation.findMany({
      where: { professionalId },
      orderBy: { date: "desc" },
    });

    return consultations.map((consultation) => this.toDomain(consultation));
  }

  async create(data: ConsultationCreateInput): Promise<Consultation> {
    const consultation = await prisma.consultation.create({
      data: {
        patientId: data.patientId,
        professionalId: data.professionalId,
        date: data.date,
        notes: data.notes ?? null,
      },
    });

    return this.toDomain(consultation);
  }

  async update(
    id: string,
    data: ConsultationUpdateInput
  ): Promise<Consultation> {
    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: data.date }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
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
    patientId: string;
    professionalId: string;
    date: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Consultation {
    return {
      id: consultation.id,
      patientId: consultation.patientId,
      professionalId: consultation.professionalId,
      date: consultation.date,
      notes: consultation.notes,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
    };
  }
}
