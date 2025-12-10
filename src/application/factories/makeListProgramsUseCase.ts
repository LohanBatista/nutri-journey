import { ListProgramsUseCase } from "../use-cases/ListPrograms";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";

export function makeListProgramsUseCase(): ListProgramsUseCase {
  const programRepository = new PrismaProgramRepository();
  return new ListProgramsUseCase(programRepository);
}

