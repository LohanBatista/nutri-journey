import type { PatientRepository } from "@/domain/repositories/PatientRepository";
import type { AnthropometryRepository } from "@/domain/repositories/AnthropometryRepository";
import type { LabResultRepository } from "@/domain/repositories/LabResultRepository";
import type { ConsultationRepository } from "@/domain/repositories/ConsultationRepository";
import type { NutritionPlanRepository } from "@/domain/repositories/NutritionPlanRepository";
import type { NutritionGeneralGuidanceRepository } from "@/domain/repositories/NutritionGeneralGuidanceRepository";

export interface GeneratePatientNutritionReportInput {
  organizationId: string;
  patientId: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface GeneratePatientNutritionReportOutput {
  patientName: string;
  reportDate: Date;
  sections: ReportSection[];
}

export class GeneratePatientNutritionReportUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly anthropometryRepository: AnthropometryRepository,
    private readonly labResultRepository: LabResultRepository,
    private readonly consultationRepository: ConsultationRepository,
    private readonly nutritionPlanRepository: NutritionPlanRepository,
    private readonly nutritionGeneralGuidanceRepository: NutritionGeneralGuidanceRepository
  ) {}

  async execute(
    input: GeneratePatientNutritionReportInput
  ): Promise<GeneratePatientNutritionReportOutput> {
    const patient = await this.patientRepository.findById(
      input.patientId,
      input.organizationId
    );

    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    const sections: ReportSection[] = [];

    // Seção: Dados do Paciente
    sections.push({
      title: "Dados do Paciente",
      content: `Nome: ${
        patient.fullName
      }\nData de Nascimento: ${this.formatDate(
        patient.dateOfBirth
      )}\nSexo: ${this.formatSex(patient.sex)}\n${
        patient.email ? `Email: ${patient.email}\n` : ""
      }${patient.phone ? `Telefone: ${patient.phone}\n` : ""}`,
    });

    // Seção: Antropometria
    const anthropometryRecords =
      await this.anthropometryRepository.listByPatient(
        input.patientId,
        input.organizationId
      );

    if (anthropometryRecords.length > 0) {
      const latest = anthropometryRecords[0];
      if (!latest) {
        throw new Error("Erro ao processar dados de antropometria");
      }
      let anthropometryContent = `Última avaliação: ${this.formatDate(
        latest.date
      )}\n\n`;

      if (latest.weightKg) {
        anthropometryContent += `Peso: ${latest.weightKg} kg\n`;
      }
      if (latest.heightM) {
        anthropometryContent += `Altura: ${latest.heightM} m\n`;
      }
      if (latest.bmi) {
        anthropometryContent += `IMC: ${latest.bmi.toFixed(2)}\n`;
      }
      if (latest.waistCircumference) {
        anthropometryContent += `Circunferência da Cintura: ${latest.waistCircumference} cm\n`;
      }
      if (latest.hipCircumference) {
        anthropometryContent += `Circunferência do Quadril: ${latest.hipCircumference} cm\n`;
      }
      if (latest.armCircumference) {
        anthropometryContent += `Circunferência do Braço: ${latest.armCircumference} cm\n`;
      }
      if (latest.notes) {
        anthropometryContent += `\nObservações: ${latest.notes}`;
      }

      sections.push({
        title: "Antropometria",
        content: anthropometryContent,
      });
    }

    // Seção: Exames Laboratoriais
    const labResults = await this.labResultRepository.listByPatient(
      input.patientId,
      input.organizationId
    );

    if (labResults.length > 0) {
      let labContent = "";
      const recentResults = labResults.slice(0, 10); // Últimos 10 exames

      for (const result of recentResults) {
        labContent += `${this.formatDate(result.date)} - ${result.name}: ${
          result.value
        } ${result.unit}`;
        if (result.referenceRange) {
          labContent += ` (Referência: ${result.referenceRange})`;
        }
        labContent += "\n";
      }

      sections.push({
        title: "Exames Laboratoriais",
        content: labContent.trim(),
      });
    }

    // Seção: Consultas
    const consultations = await this.consultationRepository.listByOrganization(
      input.organizationId,
      { patientId: input.patientId }
    );

    if (consultations.length > 0) {
      let consultationContent = "";
      const recentConsultations = consultations.slice(0, 5); // Últimas 5 consultas

      for (const consultation of recentConsultations) {
        consultationContent += `${this.formatDateTime(
          consultation.dateTime
        )} - ${this.formatConsultationType(consultation.type)}\n`;
        if (consultation.mainComplaint) {
          consultationContent += `Queixa Principal: ${consultation.mainComplaint}\n`;
        }
        if (consultation.nutritionDiagnosis) {
          consultationContent += `Diagnóstico Nutricional: ${consultation.nutritionDiagnosis}\n`;
        }
        consultationContent += "\n";
      }

      sections.push({
        title: "Histórico de Consultas",
        content: consultationContent.trim(),
      });
    }

    // Seção: Plano Nutricional Ativo
    const activePlan = await this.nutritionPlanRepository.findActiveByPatient(
      input.patientId,
      input.organizationId
    );

    if (activePlan) {
      let planContent = `Título: ${activePlan.title}\n`;
      planContent += `Objetivos: ${activePlan.goals}\n`;

      if (activePlan.meals && activePlan.meals.length > 0) {
        planContent += "\nRefeições:\n";
        for (const meal of activePlan.meals) {
          planContent += `\n${this.formatMealType(meal.mealType)}:\n`;
          planContent += `${meal.description}\n`;
          if (meal.observation) {
            planContent += `Observação: ${meal.observation}\n`;
          }
        }
      }

      if (activePlan.notes) {
        planContent += `\nObservações: ${activePlan.notes}`;
      }

      sections.push({
        title: "Plano Nutricional Ativo",
        content: planContent,
      });
    }

    // Seção: Condutas Gerais
    const latestGuidance =
      await this.nutritionGeneralGuidanceRepository.findLatestByPatient(
        input.patientId,
        input.organizationId
      );

    if (latestGuidance) {
      let guidanceContent = `Data: ${this.formatDate(latestGuidance.date)}\n\n`;

      if (latestGuidance.hydrationGuidance) {
        guidanceContent += `Hidratação:\n${latestGuidance.hydrationGuidance}\n\n`;
      }
      if (latestGuidance.physicalActivityGuidance) {
        guidanceContent += `Atividade Física:\n${latestGuidance.physicalActivityGuidance}\n\n`;
      }
      if (latestGuidance.sleepGuidance) {
        guidanceContent += `Sono:\n${latestGuidance.sleepGuidance}\n\n`;
      }
      if (latestGuidance.symptomManagementGuidance) {
        guidanceContent += `Gerenciamento de Sintomas:\n${latestGuidance.symptomManagementGuidance}\n\n`;
      }
      if (latestGuidance.notes) {
        guidanceContent += `Observações:\n${latestGuidance.notes}`;
      }

      sections.push({
        title: "Condutas Gerais",
        content: guidanceContent.trim(),
      });
    }

    return {
      patientName: patient.fullName,
      reportDate: new Date(),
      sections,
    };
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  private formatDateTime(date: Date): string {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private formatSex(sex: string): string {
    const sexMap: Record<string, string> = {
      MALE: "Masculino",
      FEMALE: "Feminino",
      OTHER: "Outro",
    };
    return sexMap[sex] || sex;
  }

  private formatConsultationType(type: string): string {
    const typeMap: Record<string, string> = {
      INITIAL: "Consulta Inicial",
      FOLLOW_UP: "Retorno",
      GROUP: "Grupo",
      HOSPITAL: "Hospitalar",
    };
    return typeMap[type] || type;
  }

  private formatMealType(mealType: string): string {
    const mealTypeMap: Record<string, string> = {
      BREAKFAST: "Café da Manhã",
      MORNING_SNACK: "Lanche da Manhã",
      LUNCH: "Almoço",
      AFTERNOON_SNACK: "Lanche da Tarde",
      DINNER: "Jantar",
      SUPPER: "Ceia",
      OTHER: "Outro",
    };
    return mealTypeMap[mealType] || mealType;
  }
}
