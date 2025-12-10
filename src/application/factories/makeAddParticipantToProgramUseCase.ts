import { AddParticipantToProgramUseCase } from "../use-cases/AddParticipantToProgram";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";
import { PrismaProgramParticipantRepository } from "@/infra/repositories/PrismaProgramParticipantRepository";

export function makeAddParticipantToProgramUseCase(): AddParticipantToProgramUseCase {
  const programRepository = new PrismaProgramRepository();
  const programParticipantRepository = new PrismaProgramParticipantRepository();
  return new AddParticipantToProgramUseCase(
    programRepository,
    programParticipantRepository
  );
}

