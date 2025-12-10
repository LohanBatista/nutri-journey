import { CreateProgramUseCase } from "../use-cases/CreateProgram";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";
import { PrismaProgramProfessionalRepository } from "@/infra/repositories/PrismaProgramProfessionalRepository";

export function makeCreateProgramUseCase(): CreateProgramUseCase {
  const programRepository = new PrismaProgramRepository();
  const programProfessionalRepository = new PrismaProgramProfessionalRepository();
  return new CreateProgramUseCase(
    programRepository,
    programProfessionalRepository
  );
}

