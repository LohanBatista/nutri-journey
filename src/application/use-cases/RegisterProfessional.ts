import type { Professional, ProfessionalRole } from "@/domain/entities/Professional";
import type { Organization } from "@/domain/entities/Organization";
import type { ProfessionalRepository } from "@/domain/repositories/ProfessionalRepository";
import type { OrganizationRepository } from "@/domain/repositories/OrganizationRepository";
import type { PasswordHasher } from "@/infra/cryptography/password-hasher";

export interface RegisterProfessionalInput {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  role?: ProfessionalRole;
}

export interface RegisterProfessionalOutput {
  professional: Professional;
  organization: Organization;
}

export class RegisterProfessionalUseCase {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: RegisterProfessionalInput): Promise<RegisterProfessionalOutput> {
    // Verificar se o email já existe
    const existingProfessional = await this.professionalRepository.findByEmail(input.email);
    if (existingProfessional) {
      throw new Error("Email já está em uso");
    }

    // Criar organização
    const organization = await this.organizationRepository.create({
      name: input.organizationName,
    });

    // Hash da senha
    const passwordHash = await this.passwordHasher.hash(input.password);

    // Criar profissional
    const professional = await this.professionalRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      organizationId: organization.id,
      role: input.role ?? "PROFESSIONAL",
    });

    return {
      professional,
      organization,
    };
  }
}

