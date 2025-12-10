import { CreateLabResultUseCase } from "../use-cases/CreateLabResult";
import { PrismaLabResultRepository } from "@/infra/repositories/PrismaLabResultRepository";

export function makeCreateLabResultUseCase(): CreateLabResultUseCase {
  const labResultRepository = new PrismaLabResultRepository();
  return new CreateLabResultUseCase(labResultRepository);
}

