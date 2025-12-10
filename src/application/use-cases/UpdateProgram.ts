import type {
  Program,
  UpdateProgramInput as DomainUpdateProgramInput,
} from "@/domain/entities/Program";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";

export interface UpdateProgramInput {
  name?: string;
  description?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: "PLANNED" | "ACTIVE" | "FINISHED";
}

export interface UpdateProgramOutput {
  program: Program;
}

export class UpdateProgramUseCase {
  constructor(private readonly programRepository: ProgramRepository) {}

  async execute(
    id: string,
    organizationId: string,
    input: UpdateProgramInput
  ): Promise<UpdateProgramOutput> {
    const existingProgram = await this.programRepository.findById(
      id,
      organizationId
    );

    if (!existingProgram) {
      throw new Error("Programa não encontrado");
    }

    const updateData: DomainUpdateProgramInput = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.endDate !== undefined && { endDate: input.endDate }),
      ...(input.status !== undefined && { status: input.status }),
    };

    const program = await this.programRepository.update(id, updateData);

    return { program };
  }
}

