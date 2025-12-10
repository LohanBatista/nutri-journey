import type { Professional } from "@/domain/entities/Professional";
import type { Organization } from "@/domain/entities/Organization";
import type { ProfessionalRepository } from "@/domain/repositories/ProfessionalRepository";
import type { OrganizationRepository } from "@/domain/repositories/OrganizationRepository";
import type { PasswordHasher } from "@/infra/cryptography/password-hasher";

export interface AuthenticateProfessionalInput {
  email: string;
  password: string;
}

export interface AuthenticateProfessionalOutput {
  professional: Professional;
  organization: Organization;
}

export class AuthenticateProfessionalUseCase {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: AuthenticateProfessionalInput): Promise<AuthenticateProfessionalOutput> {
    // Buscar profissional por email
    const professional = await this.professionalRepository.findByEmail(input.email);
    if (!professional) {
      throw new Error("Email ou senha inválidos");
    }

    // Verificar senha
    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      professional.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error("Email ou senha inválidos");
    }

    // Buscar organização
    const organization = await this.organizationRepository.findById(professional.organizationId);
    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    return {
      professional,
      organization,
    };
  }
}

