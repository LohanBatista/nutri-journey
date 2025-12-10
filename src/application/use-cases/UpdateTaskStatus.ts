import type { Task } from "@/domain/entities/Task";
import type { TaskRepository } from "@/domain/repositories/TaskRepository";

export interface UpdateTaskStatusInput {
  id: string;
  organizationId: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
}

export interface UpdateTaskStatusOutput {
  task: Task;
}

export class UpdateTaskStatusUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskStatusInput): Promise<UpdateTaskStatusOutput> {
    const existingTask = await this.taskRepository.findById(
      input.id,
      input.organizationId
    );

    if (!existingTask) {
      throw new Error("Tarefa não encontrada");
    }

    const task = await this.taskRepository.updateStatus({
      id: input.id,
      status: input.status,
    });

    return { task };
  }
}

