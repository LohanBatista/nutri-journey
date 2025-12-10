import { CreateProgramMeetingUseCase } from "../use-cases/CreateProgramMeeting";
import { PrismaProgramRepository } from "@/infra/repositories/PrismaProgramRepository";
import { PrismaProgramMeetingRepository } from "@/infra/repositories/PrismaProgramMeetingRepository";

export function makeCreateProgramMeetingUseCase(): CreateProgramMeetingUseCase {
  const programRepository = new PrismaProgramRepository();
  const programMeetingRepository = new PrismaProgramMeetingRepository();
  return new CreateProgramMeetingUseCase(
    programRepository,
    programMeetingRepository
  );
}

