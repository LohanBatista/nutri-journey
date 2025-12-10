import type { PatientRepository } from "@/domain/repositories/PatientRepository";
import type { AnthropometryRepository } from "@/domain/repositories/AnthropometryRepository";
import type { LabResultRepository } from "@/domain/repositories/LabResultRepository";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";
import type { AiNutritionService } from "@/domain/ai/AiNutritionService";
import type { AiNutritionDiagnosisSuggestionRepository } from "@/domain/repositories/AiNutritionDiagnosisSuggestionRepository";
import type { AiNutritionDiagnosisSuggestion } from "@/domain/entities/AiNutritionDiagnosisSuggestion";

export interface GenerateNutritionDiagnosisSuggestionsInput {
  organizationId: string;
  professionalId: string;
  patientId: string;
  consultationId?: string | null;
}

export interface GenerateNutritionDiagnosisSuggestionsOutput {
  suggestion: AiNutritionDiagnosisSuggestion;
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
  
  const diagnosisKeywords = ["diabetes", "hipertensão", "obesidade", "dislipidemia", "anemia", "intolerância", "alergia"];
  patientTags.forEach((tag) => {
    const lowerTag = tag.toLowerCase();
    if (diagnosisKeywords.some((keyword) => lowerTag.includes(keyword))) {
      diagnoses.push(tag);
    }
  });

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

export class GenerateNutritionDiagnosisSuggestionsUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly anthropometryRepository: AnthropometryRepository,
    private readonly labResultRepository: LabResultRepository,
    private readonly consultationRepository: ConsultationRepository,
    private readonly aiNutritionService: AiNutritionService,
    private readonly aiNutritionDiagnosisSuggestionRepository: AiNutritionDiagnosisSuggestionRepository
  ) {}

  async execute(
    input: GenerateNutritionDiagnosisSuggestionsInput
  ): Promise<GenerateNutritionDiagnosisSuggestionsOutput> {
    // Buscar paciente
    const patient = await this.patientRepository.findById(
      input.patientId,
      input.organizationId
    );

    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    // Buscar antropometria mais recente e anterior para comparação
    const anthropometryRecords = await this.anthropometryRepository.listByPatient(
      input.patientId,
      input.organizationId
    );

    const mostRecentRecord = anthropometryRecords[0];
    const previousRecord = anthropometryRecords[1] || null;
    
    const recentAnthropometry = mostRecentRecord
      ? {
          date: mostRecentRecord.date,
          weightKg: mostRecentRecord.weightKg,
          bmi: mostRecentRecord.bmi,
          waistCircumference: mostRecentRecord.waistCircumference,
          hipCircumference: mostRecentRecord.hipCircumference,
          armCircumference: mostRecentRecord.armCircumference,
          previousWeightKg: previousRecord?.weightKg ?? null,
          previousBmi: previousRecord?.bmi ?? null,
        }
      : null;

    // Buscar exames principais (priorizar últimos 6 meses, mas incluir todos se necessário)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allLabResults = await this.labResultRepository.listByPatient(
      input.patientId,
      input.organizationId
    );

    // Priorizar exames dos últimos 6 meses, mas se não houver, pegar os mais recentes disponíveis
    const recentLabResults = allLabResults.length > 0
      ? (allLabResults.filter((r) => new Date(r.date) >= sixMonthsAgo).length > 0
          ? allLabResults.filter((r) => new Date(r.date) >= sixMonthsAgo)
          : allLabResults)
          .slice(0, 15) // Aumentar para 15 exames mais relevantes
          .map((r) => ({
            date: r.date,
            name: r.name,
            testType: r.testType,
            value: String(r.value), // Converter para string
            unit: r.unit,
            referenceRange: r.referenceRange,
          }))
      : [];

    // Buscar consultas para resumo de padrão alimentar
    const consultations = await this.consultationRepository.listByOrganization(
      input.organizationId,
      { patientId: input.patientId }
    );

    // Extrair informações sobre padrão alimentar das consultas
    const dietaryInfo: string[] = [];
    consultations.slice(0, 5).forEach((consultation) => {
      if (consultation.nutritionHistory) {
        dietaryInfo.push(consultation.nutritionHistory);
      }
      if (consultation.mainComplaint) {
        dietaryInfo.push(`Queixa: ${consultation.mainComplaint}`);
      }
    });

    const dietaryPatternSummary = dietaryInfo.length > 0
      ? dietaryInfo.join("\n\n")
      : null;

    // Montar input para IA
    const aiInput = {
      patientData: {
        id: patient.id,
        name: patient.fullName,
        sex: patient.sex,
        age: calculateAge(patient.dateOfBirth),
        clinicalDiagnoses: extractClinicalDiagnoses(patient.tags, patient.notes),
      },
      recentAnthropometry,
      mainLabResults: recentLabResults,
      dietaryPatternSummary,
    };

    // Gerar diagnóstico com IA
    const aiOutput = await this.aiNutritionService.generateNutritionDiagnosis(aiInput);

    // Salvar sugestão
    const suggestion = await this.aiNutritionDiagnosisSuggestionRepository.create({
      organizationId: input.organizationId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      consultationId: input.consultationId ?? null,
      diagnoses: aiOutput.diagnoses,
    });

    return { suggestion };
  }
}

