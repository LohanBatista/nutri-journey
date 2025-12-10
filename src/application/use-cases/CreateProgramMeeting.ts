import type {
  ProgramMeeting,
  CreateProgramMeetingInput as DomainCreateProgramMeetingInput,
} from "@/domain/entities/Program";
import type { ProgramMeetingRepository } from "@/domain/repositories/ProgramMeetingRepository";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";

export interface CreateProgramMeetingInput {
  programId: string;
  date: Date;
  topic: string;
  notes?: string | null;
}

export interface CreateProgramMeetingOutput {
  meeting: ProgramMeeting;
}

export class CreateProgramMeetingUseCase {
  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly programMeetingRepository: ProgramMeetingRepository
  ) {}

  async execute(
    organizationId: string,
    input: CreateProgramMeetingInput
  ): Promise<CreateProgramMeetingOutput> {
    // Verificar se o programa existe
    const program = await this.programRepository.findById(
      input.programId,
      organizationId
    );

    if (!program) {
      throw new Error("Programa não encontrado");
    }

    const meetingData: DomainCreateProgramMeetingInput = {
      programId: input.programId,
      date: input.date,
      topic: input.topic,
      notes: input.notes ?? null,
    };

    const meeting = await this.programMeetingRepository.create(meetingData);

    return { meeting };
  }
}

