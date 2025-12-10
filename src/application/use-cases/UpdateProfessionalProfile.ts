import type {
  Professional,
  ProfessionalUpdateInput as DomainProfessionalUpdateInput,
} from "@/domain/entities/Professional";
import type { ProfessionalWithoutPassword } from "@/domain/entities/ProfessionalWithoutPassword";
import type { ProfessionalRepository } from "@/domain/repositories/ProfessionalRepository";
import type { PasswordHasher } from "@/infra/cryptography/password-hasher";

export interface UpdateProfessionalProfileInput {
  professionalId: string;
  name?: string;
  password?: string;
}

export interface UpdateProfessionalProfileOutput {
  professional: ProfessionalWithoutPassword;
}

export class UpdateProfessionalProfileUseCase {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(
    input: UpdateProfessionalProfileInput
  ): Promise<UpdateProfessionalProfileOutput> {
    const existingProfessional = await this.professionalRepository.findById(
      input.professionalId
    );

    if (!existingProfessional) {
      throw new Error("Professional not found");
    }

    const updateData: DomainProfessionalUpdateInput = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.password !== undefined) {
      updateData.passwordHash = await this.passwordHasher.hash(input.password);
    }

    const professional = await this.professionalRepository.update(
      input.professionalId,
      updateData
    );

    const { passwordHash, ...professionalWithoutPassword } = professional;

    return {
      professional: professionalWithoutPassword,
    };
  }
}

