import { RemoveParticipantFromProgramUseCase } from "../use-cases/RemoveParticipantFromProgram";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";
import { PrismaProgramParticipantRepository } from "@/infra/repositories/PrismaProgramParticipantRepository";

export function makeRemoveParticipantFromProgramUseCase(): RemoveParticipantFromProgramUseCase {
  const programRepository = new PrismaProgramRepository();
  const programParticipantRepository = new PrismaProgramParticipantRepository();
  return new RemoveParticipantFromProgramUseCase(
    programRepository,
    programParticipantRepository
  );
}

