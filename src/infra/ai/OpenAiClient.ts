import type { AiClient } from "@/domain/ai/AiClient";
import type {
  GeneratePatientSummaryInput,
  GeneratePatientSummaryOutput,
  AiSummaryType,
} from "@/domain/ai/types";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildPrompt(
  input: GeneratePatientSummaryInput,
  type: AiSummaryType
): string {
  const { patient, consultations, anthropometryRecords, labResults, activeNutritionPlan } = input;

  const sexLabel = patient.sex === "MALE" ? "Masculino" : patient.sex === "FEMALE" ? "Feminino" : "Outro";
  const diagnosesText = patient.clinicalDiagnoses.length > 0
    ? `Diagnósticos clínicos relevantes: ${patient.clinicalDiagnoses.join(", ")}`
    : "Nenhum diagnóstico clínico registrado";

  let prompt = `Você é um assistente especializado em Nutrição Clínica. Seu objetivo é gerar um resumo profissional e objetivo sobre o paciente, focado em análise nutricional e evolução.

IMPORTANTE:
- Este texto é destinado a um profissional de Nutrição
- NÃO forneça diagnóstico médico
- Foque em análise nutricional, evolução dos parâmetros e recomendações nutricionais
- Seja objetivo, claro e baseado nos dados fornecidos
- Use linguagem técnica apropriada para profissionais de saúde

DADOS DO PACIENTE:
- Nome: ${patient.name}
- Sexo: ${sexLabel}
- Idade aproximada: ${patient.approximateAge} anos
- ${diagnosesText}

`;

  if (type === "WEEKLY_OVERVIEW") {
    prompt += "TIPO DE RESUMO: Visão Semanal\n";
    prompt += "Gere um resumo focado na evolução dos últimos 7 dias, destacando mudanças recentes em parâmetros antropométricos, exames e consultas.\n\n";
  } else if (type === "FULL_HISTORY") {
    prompt += "TIPO DE RESUMO: Histórico Completo\n";
    prompt += "Gere um resumo abrangente de todo o histórico do paciente, incluindo evolução ao longo do tempo, tendências e análise nutricional completa.\n\n";
  } else if (type === "PRE_CONSULT") {
    prompt += "TIPO DE RESUMO: Pré-Consulta\n";
    prompt += "Gere um resumo conciso para preparação de consulta, destacando pontos principais que o profissional deve revisar antes do atendimento.\n\n";
  }

  if (consultations.length > 0) {
    prompt += "CONSULTAS:\n";
    consultations.forEach((consultation) => {
      const typeLabel = consultation.type === "INITIAL" ? "Inicial" :
        consultation.type === "FOLLOW_UP" ? "Retorno" :
        consultation.type === "GROUP" ? "Grupo" : "Hospitalar";
      prompt += `- ${formatDateTime(consultation.date)} - ${typeLabel}: ${consultation.summary}\n`;
    });
    prompt += "\n";
  } else {
    prompt += "CONSULTAS: Nenhuma consulta registrada\n\n";
  }

  if (anthropometryRecords.length > 0) {
    prompt += "REGISTROS ANTROPOMÉTRICOS:\n";
    anthropometryRecords.forEach((record) => {
      prompt += `- ${formatDate(record.date)}: `;
      const parts: string[] = [];
      if (record.weightKg !== null) parts.push(`Peso: ${record.weightKg} kg`);
      if (record.bmi !== null) parts.push(`IMC: ${record.bmi.toFixed(1)}`);
      if (record.waistCircumference !== null) parts.push(`Cintura: ${record.waistCircumference} cm`);
      prompt += parts.join(", ") + "\n";
    });
    prompt += "\n";
  } else {
    prompt += "REGISTROS ANTROPOMÉTRICOS: Nenhum registro encontrado\n\n";
  }

  if (labResults.length > 0) {
    prompt += "EXAMES LABORATORIAIS:\n";
    labResults.forEach((result) => {
      prompt += `- ${formatDate(result.date)} - ${result.name}: ${result.value} ${result.unit}`;
      if (result.referenceRange) {
        prompt += ` (Referência: ${result.referenceRange})`;
      }
      prompt += "\n";
    });
    prompt += "\n";
  } else {
    prompt += "EXAMES LABORATORIAIS: Nenhum exame registrado\n\n";
  }

  if (activeNutritionPlan) {
    prompt += `PLANO NUTRICIONAL ATIVO:\n`;
    prompt += `- Título: ${activeNutritionPlan.title}\n`;
    prompt += `- Objetivos: ${activeNutritionPlan.goals}\n\n`;
  } else {
    prompt += "PLANO NUTRICIONAL ATIVO: Nenhum plano ativo\n\n";
  }

  prompt += "Gere o resumo profissional seguindo as diretrizes acima.";

  return prompt;
}

export class OpenAiClient implements AiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || "";
    this.baseUrl = "https://api.openai.com/v1";
  }

  async generatePatientSummary(
    input: GeneratePatientSummaryInput,
    type: AiSummaryType
  ): Promise<GeneratePatientSummaryOutput> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = buildPrompt(input, type);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em Nutrição Clínica. Gere resumos profissionais, objetivos e baseados em evidências para profissionais de Nutrição.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      if (
        !data.choices ||
        !Array.isArray(data.choices) ||
        data.choices.length === 0 ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        throw new Error("Invalid response format from OpenAI API");
      }

      return {
        textForProfessional: data.choices[0].message.content as string,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to generate patient summary");
    }
  }
}

