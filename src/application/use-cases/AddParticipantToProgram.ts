import type {
  ProgramParticipant,
  AddParticipantToProgramInput as DomainAddParticipantToProgramInput,
} from "@/domain/entities/Program";
import type { ProgramParticipantRepository } from "@/domain/repositories/ProgramParticipantRepository";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";

export interface AddParticipantToProgramInput {
  programId: string;
  patientId: string;
  notes?: string | null;
}

export interface AddParticipantToProgramOutput {
  participant: ProgramParticipant;
}

export class AddParticipantToProgramUseCase {
  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly programParticipantRepository: ProgramParticipantRepository
  ) {}

  async execute(
    organizationId: string,
    input: AddParticipantToProgramInput
  ): Promise<AddParticipantToProgramOutput> {
    // Verificar se o programa existe
    const program = await this.programRepository.findById(
      input.programId,
      organizationId
    );

    if (!program) {
      throw new Error("Programa não encontrado");
    }

    // Verificar se o participante já está no programa
    const existingParticipant =
      await this.programParticipantRepository.findByProgramAndPatient(
        input.programId,
        input.patientId
      );

    if (existingParticipant) {
      throw new Error("Paciente já está participando deste programa");
    }

    const participantData: DomainAddParticipantToProgramInput = {
      programId: input.programId,
      patientId: input.patientId,
      notes: input.notes ?? null,
    };

    const participant =
      await this.programParticipantRepository.addParticipant(participantData);

    return { participant };
  }
}

