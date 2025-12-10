export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  organizationId: string;
  professionalId: string;
  patientId: string | null;
  programId: string | null;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  organizationId: string;
  professionalId: string;
  patientId?: string | null;
  programId?: string | null;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: TaskStatus;
}

export interface UpdateTaskStatusInput {
  id: string;
  status: TaskStatus;
}

export interface TaskListFilters {
  status?: TaskStatus;
  patientId?: string;
  programId?: string;
  professionalId?: string;
}

