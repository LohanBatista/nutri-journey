import type { Program, ProgramListFilters } from "@/domain/entities/Program";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";

export interface ListProgramsInput {
  organizationId: string;
  filters?: ProgramListFilters;
}

export interface ListProgramsOutput {
  programs: Program[];
}

export class ListProgramsUseCase {
  constructor(private readonly programRepository: ProgramRepository) {}

  async execute(input: ListProgramsInput): Promise<ListProgramsOutput> {
    const programs = await this.programRepository.listByOrganization(
      input.organizationId,
      input.filters
    );

    return { programs };
  }
}

