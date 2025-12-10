import type { ProgramParticipantRepository } from "@/domain/repositories/ProgramParticipantRepository";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";

export interface RemoveParticipantFromProgramInput {
  programId: string;
  patientId: string;
}

export interface RemoveParticipantFromProgramOutput {
  success: boolean;
}

export class RemoveParticipantFromProgramUseCase {
  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly programParticipantRepository: ProgramParticipantRepository
  ) {}

  async execute(
    organizationId: string,
    input: RemoveParticipantFromProgramInput
  ): Promise<RemoveParticipantFromProgramOutput> {
    // Verificar se o programa existe
    const program = await this.programRepository.findById(
      input.programId,
      organizationId
    );

    if (!program) {
      throw new Error("Programa não encontrado");
    }

    // Verificar se o participante está no programa
    const existingParticipant =
      await this.programParticipantRepository.findByProgramAndPatient(
        input.programId,
        input.patientId
      );

    if (!existingParticipant) {
      throw new Error("Paciente não está participando deste programa");
    }

    await this.programParticipantRepository.removeParticipant(
      input.programId,
      input.patientId
    );

    return { success: true };
  }
}

