import { ListPatientAnthropometryRecordsUseCase } from "../use-cases/ListPatientAnthropometryRecords";
import { PrismaAnthropometryRepository } from "@/infra/repositories/PrismaAnthropometryRepository";

export function makeListPatientAnthropometryRecordsUseCase(): ListPatientAnthropometryRecordsUseCase {
  const anthropometryRepository = new PrismaAnthropometryRepository();
  return new ListPatientAnthropometryRecordsUseCase(anthropometryRepository);
}

