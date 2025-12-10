import { ListTasksUseCase } from "../use-cases/ListTasks";
import { PrismaTaskRepository } from "@/infra/repositories/PrismaTaskRepository";

export function makeListTasksUseCase(): ListTasksUseCase {
  const taskRepository = new PrismaTaskRepository();
  return new ListTasksUseCase(taskRepository);
}

