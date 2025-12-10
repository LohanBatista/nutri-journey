import type { Program } from "@/domain/entities/Program";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";

export interface GetProgramInput {
  id: string;
  organizationId: string;
}

export interface GetProgramOutput {
  program: Program;
}

export class GetProgramUseCase {
  constructor(private readonly programRepository: ProgramRepository) {}

  async execute(input: GetProgramInput): Promise<GetProgramOutput> {
    const program = await this.programRepository.findById(
      input.id,
      input.organizationId
    );

    if (!program) {
      throw new Error("Programa não encontrado");
    }

    return { program };
  }
}

