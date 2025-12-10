import { UpdateTaskStatusUseCase } from "../use-cases/UpdateTaskStatus";
import { PrismaTaskRepository } from "@/infra/repositories/PrismaTaskRepository";

export function makeUpdateTaskStatusUseCase(): UpdateTaskStatusUseCase {
  const taskRepository = new PrismaTaskRepository();
  return new UpdateTaskStatusUseCase(taskRepository);
}

