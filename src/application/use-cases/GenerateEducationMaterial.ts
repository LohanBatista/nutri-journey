import type { PatientRepository } from "@/domain/repositories/PatientRepository";
import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";
import type { AiNutritionService } from "@/domain/ai/AiNutritionService";
import type { AiEducationMaterialRepository } from "@/domain/repositories/AiEducationMaterialRepository";
import type { AiEducationMaterial } from "@/domain/entities/AiEducationMaterial";

export interface GenerateEducationMaterialInput {
  organizationId: string;
  topic: string;
  context: "INDIVIDUAL" | "GROUP";
  patientId?: string | null;
  programId?: string | null;
}

export interface GenerateEducationMaterialOutput {
  material: AiEducationMaterial;
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export class GenerateEducationMaterialUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly programRepository: ProgramRepository,
    private readonly aiNutritionService: AiNutritionService,
    private readonly aiEducationMaterialRepository: AiEducationMaterialRepository
  ) {}

  async execute(
    input: GenerateEducationMaterialInput
  ): Promise<GenerateEducationMaterialOutput> {
    let patientInfo: {
      name: string;
      age: number;
      sex: "MALE" | "FEMALE" | "OTHER";
      clinicalConditions: string[];
    } | undefined;

    let programInfo: {
      name: string;
      description: string;
      targetAudience: string;
    } | undefined;

    // Buscar informações do paciente se contexto individual
    if (input.context === "INDIVIDUAL" && input.patientId) {
      const patient = await this.patientRepository.findById(
        input.patientId,
        input.organizationId
      );

      if (!patient) {
        throw new Error("Paciente não encontrado");
      }

      patientInfo = {
        name: patient.fullName,
        age: calculateAge(patient.dateOfBirth),
        sex: patient.sex,
        clinicalConditions: patient.tags.filter((tag) => {
          const lowerTag = tag.toLowerCase();
          return ["diabetes", "hipertensão", "obesidade", "dislipidemia", "anemia"].some(
            (keyword) => lowerTag.includes(keyword)
          );
        }),
      };
    }

    // Buscar informações do programa se contexto grupo
    if (input.context === "GROUP" && input.programId) {
      const program = await this.programRepository.findById(
        input.programId,
        input.organizationId
      );

      if (!program) {
        throw new Error("Programa não encontrado");
      }

      const participantsCount = program.participants?.length || 0;
      
      programInfo = {
        name: program.name,
        description: program.description,
        targetAudience: `${participantsCount} participantes do programa ${program.name}`,
      };
    }

    // Montar input para IA
    const aiInput: {
      topic: string;
      context: "INDIVIDUAL" | "GROUP";
      patientInfo?: {
        name: string;
        age: number;
        sex: "MALE" | "FEMALE" | "OTHER";
        clinicalConditions: string[];
      };
      programInfo?: {
        name: string;
        description: string;
        targetAudience: string;
      };
    } = {
      topic: input.topic,
      context: input.context,
    };

    if (patientInfo) {
      aiInput.patientInfo = patientInfo;
    }

    if (programInfo) {
      aiInput.programInfo = programInfo;
    }

    // Gerar material educativo com IA
    const aiOutput = await this.aiNutritionService.generateEducationMaterial(aiInput);

    // Salvar material
    const material = await this.aiEducationMaterialRepository.create({
      organizationId: input.organizationId,
      patientId: input.patientId ?? null,
      programId: input.programId ?? null,
      topic: input.topic,
      context: input.context,
      text: aiOutput.text,
    });

    return { material };
  }
}

