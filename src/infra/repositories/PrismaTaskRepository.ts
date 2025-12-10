import type {
  Task,
  CreateTaskInput,
  UpdateTaskStatusInput,
  TaskListFilters,
} from "@/domain/entities/Task";
import type { TaskRepository } from "@/domain/repositories/TaskRepository";
import { prisma } from "../database/prisma";

export class PrismaTaskRepository implements TaskRepository {
  async findById(id: string, organizationId: string): Promise<Task | null> {
    const task = await prisma.task.findFirst({
      where: { id, organizationId },
    });

    if (!task) {
      return null;
    }

    return this.toDomain(task);
  }

  async listByOrganization(
    organizationId: string,
    filters?: TaskListFilters
  ): Promise<Task[]> {
    const where: {
      organizationId: string;
      status?: string;
      patientId?: string;
      programId?: string;
      professionalId?: string;
    } = {
      organizationId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.programId) {
      where.programId = filters.programId;
    }

    if (filters?.professionalId) {
      where.professionalId = filters.professionalId;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return tasks.map((task) => this.toDomain(task));
  }

  async create(data: CreateTaskInput): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        organizationId: data.organizationId,
        professionalId: data.professionalId,
        patientId: data.patientId ?? null,
        programId: data.programId ?? null,
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ?? null,
        status: data.status ?? "PENDING",
      },
    });

    return this.toDomain(task);
  }

  async updateStatus(data: UpdateTaskStatusInput): Promise<Task> {
    const task = await prisma.task.update({
      where: { id: data.id },
      data: {
        status: data.status,
      },
    });

    return this.toDomain(task);
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    });
  }

  private toDomain(task: {
    id: string;
    organizationId: string;
    professionalId: string;
    patientId: string | null;
    programId: string | null;
    title: string;
    description: string | null;
    dueDate: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return {
      id: task.id,
      organizationId: task.organizationId,
      professionalId: task.professionalId,
      patientId: task.patientId,
      programId: task.programId,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status as "PENDING" | "IN_PROGRESS" | "DONE",
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

