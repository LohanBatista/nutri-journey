import type {
  Task,
  CreateTaskInput,
  UpdateTaskStatusInput,
  TaskListFilters,
} from "../entities/Task";

export interface TaskRepository {
  findById(id: string, organizationId: string): Promise<Task | null>;
  listByOrganization(
    organizationId: string,
    filters?: TaskListFilters
  ): Promise<Task[]>;
  create(data: CreateTaskInput): Promise<Task>;
  updateStatus(data: UpdateTaskStatusInput): Promise<Task>;
  delete(id: string): Promise<void>;
}

