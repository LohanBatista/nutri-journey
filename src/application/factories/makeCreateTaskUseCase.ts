import { CreateTaskUseCase } from "../use-cases/CreateTask";
import { PrismaTaskRepository } from "@/infra/repositories/PrismaTaskRepository";

export function makeCreateTaskUseCase(): CreateTaskUseCase {
  const taskRepository = new PrismaTaskRepository();
  return new CreateTaskUseCase(taskRepository);
}

