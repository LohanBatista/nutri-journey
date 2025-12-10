import type {
  Program,
  CreateProgramInput,
  UpdateProgramInput,
  ProgramListFilters,
} from "../entities/Program";

export interface ProgramRepository {
  findById(id: string, organizationId: string): Promise<Program | null>;
  listByOrganization(
    organizationId: string,
    filters?: ProgramListFilters
  ): Promise<Program[]>;
  create(data: CreateProgramInput): Promise<Program>;
  update(id: string, data: UpdateProgramInput): Promise<Program>;
  delete(id: string): Promise<void>;
}

