import { ListPatientLabResultsUseCase } from "../use-cases/ListPatientLabResults";
import { PrismaLabResultRepository } from "@/infra/repositories/PrismaLabResultRepository";

export function makeListPatientLabResultsUseCase(): ListPatientLabResultsUseCase {
  const labResultRepository = new PrismaLabResultRepository();
  return new ListPatientLabResultsUseCase(labResultRepository);
}

