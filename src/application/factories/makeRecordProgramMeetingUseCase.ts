import { RecordProgramMeetingUseCase } from "../use-cases/RecordProgramMeeting";
import { PrismaProgramMeetingRepository } from "@/infra/repositories/PrismaProgramMeetingRepository";
import { PrismaProgramMeetingRecordRepository } from "@/infra/repositories/PrismaProgramMeetingRecordRepository";

export function makeRecordProgramMeetingUseCase(): RecordProgramMeetingUseCase {
  const programMeetingRepository = new PrismaProgramMeetingRepository();
  const programMeetingRecordRepository =
    new PrismaProgramMeetingRecordRepository();
  return new RecordProgramMeetingUseCase(
    programMeetingRepository,
    programMeetingRecordRepository
  );
}

