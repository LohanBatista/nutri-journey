import type { ProfessionalWithoutPassword } from "@/domain/entities/ProfessionalWithoutPassword";
import type { ProfessionalRepository } from "@/domain/repositories/ProfessionalRepository";

export interface GetCurrentProfessionalProfileInput {
  professionalId: string;
}

export interface GetCurrentProfessionalProfileOutput {
  professional: ProfessionalWithoutPassword;
}

export class GetCurrentProfessionalProfileUseCase {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  async execute(
    input: GetCurrentProfessionalProfileInput
  ): Promise<GetCurrentProfessionalProfileOutput> {
    const professional = await this.professionalRepository.findById(
      input.professionalId
    );

    if (!professional) {
      throw new Error("Professional not found");
    }

    const { passwordHash, ...professionalWithoutPassword } = professional;

    return {
      professional: professionalWithoutPassword,
    };
  }
}

