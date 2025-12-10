import type { PatientRepository } from "@/domain/repositories/PatientRepository";
import type { AnthropometryRepository } from "@/domain/repositories/AnthropometryRepository";
import type { LabResultRepository } from "@/domain/repositories/LabResultRepository";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";
import type { NutritionPlanRepository } from "@/domain/repositories/NutritionPlanRepository";
import type { AiClient } from "@/domain/ai/AiClient";
import type { AiSummaryRepository } from "@/domain/repositories/AiSummaryRepository";
import type {
  GeneratePatientSummaryInput,
  AiSummaryType,
} from "@/domain/ai/types";
import type { AiSummary } from "@/domain/entities/AiSummary";

export interface GeneratePatientSummaryUseCaseInput {
  organizationId: string;
  professionalId: string;
  patientId: string;
  summaryType: AiSummaryType;
  periodStart?: Date | null;
  periodEnd?: Date | null;
}

export interface GeneratePatientSummaryUseCaseOutput {
  aiSummary: AiSummary;
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

function extractClinicalDiagnoses(patientTags: string[], patientNotes: string | null): string[] {
  const diagnoses: string[] = [];
  
  // Extrair das tags que parecem diagnósticos
  const diagnosisKeywords = ["diabetes", "hipertensão", "obesidade", "dislipidemia", "anemia", "intolerância", "alergia"];
  patientTags.forEach((tag) => {
    const lowerTag = tag.toLowerCase();
    if (diagnosisKeywords.some((keyword) => lowerTag.includes(keyword))) {
      diagnoses.push(tag);
    }
  });

  // Se não encontrou nas tags, tentar extrair das notas
  if (diagnoses.length === 0 && patientNotes) {
    const notesLower = patientNotes.toLowerCase();
    diagnosisKeywords.forEach((keyword) => {
      if (notesLower.includes(keyword)) {
        diagnoses.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });
  }

  return diagnoses;
}

export class GeneratePatientSummaryUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly consultationRepository: ConsultationRepository,
    private readonly anthropometryRepository: AnthropometryRepository,
    private readonly labResultRepository: LabResultRepository,
    private readonly nutritionPlanRepository: NutritionPlanRepository,
    private readonly aiClient: AiClient,
    private readonly aiSummaryRepository: AiSummaryRepository
  ) {}

  async execute(
    input: GeneratePatientSummaryUseCaseInput
  ): Promise<GeneratePatientSummaryUseCaseOutput> {
    // Buscar paciente
    const patient = await this.patientRepository.findById(
      input.patientId,
      input.organizationId
    );

    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    // Preparar filtros de período
    const periodStart = input.periodStart || null;
    const periodEnd = input.periodEnd || null;

    // Buscar consultas
    const consultationFilters: {
      patientId: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      patientId: input.patientId,
    };

    if (periodStart) {
      consultationFilters.startDate = periodStart;
    }
    if (periodEnd) {
      consultationFilters.endDate = periodEnd;
    }

    const consultations = await this.consultationRepository.listByOrganization(
      input.organizationId,
      consultationFilters
    );

    // Buscar registros antropométricos
    const anthropometryFilters: {
      patientId: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      patientId: input.patientId,
    };

    if (periodStart) {
      anthropometryFilters.startDate = periodStart;
    }
    if (periodEnd) {
      anthropometryFilters.endDate = periodEnd;
    }

    const anthropometryRecords =
      await this.anthropometryRepository.listByPatient(
        input.patientId,
        input.organizationId,
        anthropometryFilters
      );

    // Buscar exames laboratoriais
    const labResultFilters: {
      patientId: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      patientId: input.patientId,
    };

    if (periodStart) {
      labResultFilters.startDate = periodStart;
    }
    if (periodEnd) {
      labResultFilters.endDate = periodEnd;
    }

    const labResults = await this.labResultRepository.listByPatient(
      input.patientId,
      input.organizationId,
      labResultFilters
    );

    // Buscar plano nutricional ativo
    const activeNutritionPlan =
      await this.nutritionPlanRepository.findActiveByPatient(
        input.patientId,
        input.organizationId
      );

    // Montar dados para o AI Client
    const aiInput: GeneratePatientSummaryInput = {
      patient: {
        id: patient.id,
        name: patient.fullName,
        sex: patient.sex,
        approximateAge: calculateAge(patient.dateOfBirth),
        clinicalDiagnoses: extractClinicalDiagnoses(patient.tags, patient.notes),
      },
      consultations: consultations.map((consultation) => {
        // Criar resumo da consulta combinando campos relevantes
        const summaryParts: string[] = [];
        if (consultation.mainComplaint) {
          summaryParts.push(`Queixa: ${consultation.mainComplaint}`);
        }
        if (consultation.nutritionDiagnosis) {
          summaryParts.push(`Diagnóstico: ${consultation.nutritionDiagnosis}`);
        }
        if (consultation.plan) {
          summaryParts.push(`Plano: ${consultation.plan}`);
        }

        return {
          date: consultation.dateTime,
          type: consultation.type,
          summary: summaryParts.length > 0 ? summaryParts.join("; ") : "Consulta registrada",
        };
      }),
      anthropometryRecords: anthropometryRecords.map((record) => ({
        date: record.date,
        weightKg: record.weightKg,
        bmi: record.bmi,
        waistCircumference: record.waistCircumference,
      })),
      labResults: labResults.map((result) => ({
        date: result.date,
        testType: result.testType,
        name: result.name,
        value: result.value,
        unit: result.unit,
        referenceRange: result.referenceRange,
      })),
      activeNutritionPlan: activeNutritionPlan
        ? {
            title: activeNutritionPlan.title,
            goals: activeNutritionPlan.goals,
          }
        : null,
    };

    // Gerar resumo com IA
    const aiOutput = await this.aiClient.generatePatientSummary(
      aiInput,
      input.summaryType
    );

    // Salvar resumo no repositório
    const aiSummary = await this.aiSummaryRepository.create({
      organizationId: input.organizationId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      type: input.summaryType,
      periodStart: periodStart,
      periodEnd: periodEnd,
      textForProfessional: aiOutput.textForProfessional,
    });

    return { aiSummary };
  }
}

