import { GetProgramUseCase } from "../use-cases/GetProgram";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";

export function makeGetProgramUseCase(): GetProgramUseCase {
  const programRepository = new PrismaProgramRepository();
  return new GetProgramUseCase(programRepository);
}

