import type { Task, TaskListFilters } from "@/domain/entities/Task";
import type { TaskRepository } from "@/domain/repositories/TaskRepository";

export interface ListTasksInput {
  organizationId: string;
  filters?: {
    status?: "PENDING" | "IN_PROGRESS" | "DONE";
    patientId?: string;
    programId?: string;
    professionalId?: string;
  };
}

export interface ListTasksOutput {
  tasks: Task[];
}

export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ListTasksInput): Promise<ListTasksOutput> {
    let filters: TaskListFilters | undefined = undefined;

    if (input.filters) {
      const filterObj: TaskListFilters = {};

      if (input.filters.status !== undefined) {
        filterObj.status = input.filters.status;
      }

      if (input.filters.patientId !== undefined) {
        filterObj.patientId = input.filters.patientId;
      }

      if (input.filters.programId !== undefined) {
        filterObj.programId = input.filters.programId;
      }

      if (input.filters.professionalId !== undefined) {
        filterObj.professionalId = input.filters.professionalId;
      }

      // Só criar o objeto de filtros se tiver pelo menos uma propriedade
      if (Object.keys(filterObj).length > 0) {
        filters = filterObj;
      }
    }

    const tasks = await this.taskRepository.listByOrganization(
      input.organizationId,
      filters
    );

    return { tasks };
  }
}

