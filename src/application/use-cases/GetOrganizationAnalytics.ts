import type { PatientRepository } from "@/domain/repositories/PatientRepository";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";

export interface GetOrganizationAnalyticsInput {
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GetOrganizationAnalyticsOutput {
  activePatientsCount: number;
  consultationsCount: number;
  activeProgramsCount: number;
  finishedProgramsCount: number;
}

export class GetOrganizationAnalyticsUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly consultationRepository: ConsultationRepository,
    private readonly programRepository: ProgramRepository
  ) {}

  async execute(
    input: GetOrganizationAnalyticsInput
  ): Promise<GetOrganizationAnalyticsOutput> {
    const [patients, consultations, programs] = await Promise.all([
      this.patientRepository.listByOrganization(input.organizationId),
      this.consultationRepository.listByOrganization(
        input.organizationId,
        input.startDate && input.endDate
          ? {
              startDate: input.startDate,
              endDate: input.endDate,
            }
          : undefined
      ),
      this.programRepository.listByOrganization(input.organizationId),
    ]);

    const activePatientsCount = patients.length;

    const consultationsCount = consultations.length;

    const activeProgramsCount = programs.filter(
      (p) => p.status === "ACTIVE"
    ).length;

    const finishedProgramsCount = programs.filter(
      (p) => p.status === "FINISHED"
    ).length;

    return {
      activePatientsCount,
      consultationsCount,
      activeProgramsCount,
      finishedProgramsCount,
    };
  }
}

