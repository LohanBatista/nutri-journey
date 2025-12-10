import { CreateAnthropometryRecordUseCase } from "../use-cases/CreateAnthropometryRecord";
import { PrismaAnthropometryRepository } from "@/infra/repositories/PrismaAnthropometryRepository";

export function makeCreateAnthropometryRecordUseCase(): CreateAnthropometryRecordUseCase {
  const anthropometryRepository = new PrismaAnthropometryRepository();
  return new CreateAnthropometryRecordUseCase(anthropometryRepository);
}

