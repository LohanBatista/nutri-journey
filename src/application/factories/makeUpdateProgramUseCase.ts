import { UpdateProgramUseCase } from "../use-cases/UpdateProgram";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";

export function makeUpdateProgramUseCase(): UpdateProgramUseCase {
  const programRepository = new PrismaProgramRepository();
  return new UpdateProgramUseCase(programRepository);
}

