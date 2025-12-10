import type { Task, CreateTaskInput as DomainCreateTaskInput } from "@/domain/entities/Task";
import type { TaskRepository } from "@/domain/repositories/TaskRepository";

export interface CreateTaskInput {
  organizationId: string;
  professionalId: string;
  patientId?: string | null;
  programId?: string | null;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: "PENDING" | "IN_PROGRESS" | "DONE";
}

export interface CreateTaskOutput {
  task: Task;
}

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    const taskData: DomainCreateTaskInput = {
      organizationId: input.organizationId,
      professionalId: input.professionalId,
      patientId: input.patientId ?? null,
      programId: input.programId ?? null,
      title: input.title,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      status: input.status ?? "PENDING",
    };

    const task = await this.taskRepository.create(taskData);

    return { task };
  }
}

