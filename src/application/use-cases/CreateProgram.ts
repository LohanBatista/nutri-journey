import type {
  Program,
  CreateProgramInput as DomainCreateProgramInput,
} from "@/domain/entities/Program";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";
import type { ProgramProfessionalRepository } from "@/domain/repositories/ProgramProfessionalRepository";

export interface CreateProgramInput {
  organizationId: string;
  name: string;
  description: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: "PLANNED" | "ACTIVE" | "FINISHED";
  professionalIds?: string[];
}

export interface CreateProgramOutput {
  program: Program;
}

export class CreateProgramUseCase {
  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly programProfessionalRepository: ProgramProfessionalRepository
  ) {}

  async execute(input: CreateProgramInput): Promise<CreateProgramOutput> {
    const programData: DomainCreateProgramInput = {
      organizationId: input.organizationId,
      name: input.name,
      description: input.description,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      status: input.status ?? "PLANNED",
      professionalIds: input.professionalIds ?? [],
    };

    const program = await this.programRepository.create(programData);

    // Adicionar profissionais ao programa
    if (input.professionalIds && input.professionalIds.length > 0) {
      for (const professionalId of input.professionalIds) {
        await this.programProfessionalRepository.addProfessional(
          program.id,
          professionalId,
          "NUTRITIONIST"
        );
      }
    }

    return { program };
  }
}

