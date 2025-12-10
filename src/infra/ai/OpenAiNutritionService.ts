import type { AiNutritionService } from "@/domain/ai/AiNutritionService";
import type {
  GenerateNutritionDiagnosisInput,
  GenerateNutritionDiagnosisOutput,
  GenerateEducationMaterialInput,
  GenerateEducationMaterialOutput,
  GenerateProgramSummaryInput,
  GenerateProgramSummaryOutput,
} from "@/domain/ai/types";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildNutritionDiagnosisPrompt(
  input: GenerateNutritionDiagnosisInput
): string {
  const { patientData, recentAnthropometry, mainLabResults, dietaryPatternSummary } = input;

  const sexLabel = patientData.sex === "MALE" ? "Masculino" : patientData.sex === "FEMALE" ? "Feminino" : "Outro";
  const diagnosesText = patientData.clinicalDiagnoses.length > 0
    ? `Diagnósticos clínicos: ${patientData.clinicalDiagnoses.join(", ")}`
    : "Nenhum diagnóstico clínico registrado";

  let prompt = `Você é um assistente especializado em Nutrição Clínica com conhecimento profundo da Classificação Internacional das Doenças (CID) e da Taxonomia NANDA Internacional para diagnósticos nutricionais.

IMPORTANTE:
- Você deve sugerir diagnósticos nutricionais baseados na Taxonomia NANDA Internacional
- Use o formato PES (Problema, Etiologia, Sinais/Sintomas) quando aplicável
- Seja objetivo, preciso e baseado em evidências
- Forneça múltiplas sugestões quando apropriado
- Cada diagnóstico deve incluir: título claro, formato PES (se aplicável) e justificativa (rationale)

DADOS DO PACIENTE:
- Nome: ${patientData.name}
- Sexo: ${sexLabel}
- Idade: ${patientData.age} anos
- ${diagnosesText}

`;

  if (recentAnthropometry) {
    prompt += `ANTROPOMETRIA (${formatDate(recentAnthropometry.date)}):\n`;
    if (recentAnthropometry.weightKg !== null) {
      prompt += `- Peso: ${recentAnthropometry.weightKg} kg\n`;
    }
    if (recentAnthropometry.bmi !== null) {
      prompt += `- IMC: ${recentAnthropometry.bmi.toFixed(1)}\n`;
    }
    if (recentAnthropometry.waistCircumference !== null) {
      prompt += `- Circunferência da Cintura: ${recentAnthropometry.waistCircumference} cm\n`;
    }
    prompt += "\n";
  } else {
    prompt += "ANTROPOMETRIA: Não há registros recentes\n\n";
  }

  if (mainLabResults.length > 0) {
    prompt += "EXAMES LABORATORIAIS PRINCIPAIS:\n";
    mainLabResults.forEach((result) => {
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

  if (dietaryPatternSummary) {
    prompt += `PADRÃO ALIMENTAR:\n${dietaryPatternSummary}\n\n`;
  } else {
    prompt += "PADRÃO ALIMENTAR: Informações não disponíveis\n\n";
  }

  prompt += `Gere sugestões de diagnósticos nutricionais seguindo o formato JSON abaixo. Retorne APENAS um array JSON válido, sem markdown ou texto adicional:

[
  {
    "title": "Título do diagnóstico nutricional (conforme NANDA)",
    "pesFormat": "Problema relacionado a [etiologia] evidenciado por [sinais/sintomas]",
    "rationale": "Justificativa baseada nos dados fornecidos"
  }
]`;

  return prompt;
}

function buildEducationMaterialPrompt(
  input: GenerateEducationMaterialInput
): string {
  const { topic, context, patientInfo, programInfo } = input;

  let prompt = `Você é um assistente especializado em Educação Nutricional. Seu objetivo é gerar material educativo claro, didático e baseado em evidências científicas.

CONTEXTO: ${context === "INDIVIDUAL" ? "Atendimento Individual" : "Programa em Grupo"}
TÓPICO: ${topic}

`;

  if (context === "INDIVIDUAL" && patientInfo) {
    const sexLabel = patientInfo.sex === "MALE" ? "Masculino" : patientInfo.sex === "FEMALE" ? "Feminino" : "Outro";
    prompt += `PACIENTE:
- Nome: ${patientInfo.name}
- Idade: ${patientInfo.age} anos
- Sexo: ${sexLabel}
- Condições clínicas: ${patientInfo.clinicalConditions.length > 0 ? patientInfo.clinicalConditions.join(", ") : "Nenhuma"}

`;
  }

  if (context === "GROUP" && programInfo) {
    prompt += `PROGRAMA:
- Nome: ${programInfo.name}
- Descrição: ${programInfo.description}
- Público-alvo: ${programInfo.targetAudience}

`;
  }

  prompt += `DIRETRIZES:
- Use linguagem clara e acessível
- Inclua informações práticas e aplicáveis
- Baseado em evidências científicas atuais
- Seja motivacional e encorajador
- Estruture o texto de forma didática
- Adapte o conteúdo ao contexto (individual ou grupo)

Gere o material educativo sobre "${topic}" seguindo as diretrizes acima.`;

  return prompt;
}

function buildProgramSummaryPrompt(
  input: GenerateProgramSummaryInput
): string {
  const { program, objectives, participants, meetings, averageEvolution } = input;

  let prompt = `Você é um assistente especializado em análise de programas de Nutrição em grupo. Seu objetivo é gerar resumos profissionais e objetivos sobre programas nutricionais.

DADOS DO PROGRAMA:
- Nome: ${program.name}
- Descrição: ${program.description}
- Status: ${program.status}
- Data de início: ${program.startDate ? formatDate(program.startDate) : "Não definida"}
- Data de término: ${program.endDate ? formatDate(program.endDate) : "Não definida"}

OBJETIVOS:
${objectives}

PARTICIPANTES (${participants.length}):
`;

  participants.forEach((participant, index) => {
    if (index < 10) {
      prompt += `- ${participant.name} (entrada: ${formatDate(participant.joinDate)})\n`;
    }
  });
  if (participants.length > 10) {
    prompt += `- ... e mais ${participants.length - 10} participantes\n`;
  }

  prompt += `\nENCONTROS REALIZADOS (${meetings.length}):\n`;
  meetings.slice(0, 10).forEach((meeting) => {
    prompt += `- ${formatDate(meeting.date)}: ${meeting.topic} (${meeting.participantsCount} participantes)\n`;
    if (meeting.notes) {
      prompt += `  Observações: ${meeting.notes.substring(0, 100)}${meeting.notes.length > 100 ? "..." : ""}\n`;
    }
  });
  if (meetings.length > 10) {
    prompt += `- ... e mais ${meetings.length - 10} encontros\n`;
  }

  if (averageEvolution) {
    prompt += `\nEVOLUÇÃO MÉDIA:\n`;
    if (averageEvolution.averageWeightChange !== null) {
      prompt += `- Variação média de peso: ${averageEvolution.averageWeightChange > 0 ? "+" : ""}${averageEvolution.averageWeightChange.toFixed(2)} kg\n`;
    }
    if (averageEvolution.averageBmiChange !== null) {
      prompt += `- Variação média de IMC: ${averageEvolution.averageBmiChange > 0 ? "+" : ""}${averageEvolution.averageBmiChange.toFixed(2)}\n`;
    }
    prompt += `- Taxa de comparecimento: ${(averageEvolution.attendanceRate * 100).toFixed(1)}%\n`;
  }

  prompt += `\nGere um resumo profissional e objetivo do programa, destacando:
- Objetivos e alcance
- Participação e engajamento
- Principais temas abordados
- Evolução dos participantes (se disponível)
- Destaques e observações relevantes`;

  return prompt;
}

async function callOpenAI(prompt: string, systemMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const baseUrl = "https://api.openai.com/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemMessage,
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

  return data.choices[0].message.content as string;
}

export class OpenAiNutritionService implements AiNutritionService {
  async generateNutritionDiagnosis(
    input: GenerateNutritionDiagnosisInput
  ): Promise<GenerateNutritionDiagnosisOutput> {
    const prompt = buildNutritionDiagnosisPrompt(input);
    const systemMessage =
      "Você é um assistente especializado em Nutrição Clínica com conhecimento profundo da Taxonomia NANDA Internacional. Gere sugestões de diagnósticos nutricionais precisos e baseados em evidências.";

    try {
      const response = await callOpenAI(prompt, systemMessage);
      
      // Tentar extrair JSON da resposta
      let jsonStr = response.trim();
      
      // Remover markdown code blocks se existirem
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
      }
      
      const diagnoses = JSON.parse(jsonStr) as Array<{
        title: string;
        pesFormat: string | null;
        rationale: string;
      }>;

      return { diagnoses };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao gerar diagnóstico nutricional: ${error.message}`);
      }
      throw new Error("Erro desconhecido ao gerar diagnóstico nutricional");
    }
  }

  async generateEducationMaterial(
    input: GenerateEducationMaterialInput
  ): Promise<GenerateEducationMaterialOutput> {
    const prompt = buildEducationMaterialPrompt(input);
    const systemMessage =
      "Você é um assistente especializado em Educação Nutricional. Gere materiais educativos claros, didáticos e baseados em evidências científicas.";

    const text = await callOpenAI(prompt, systemMessage);
    return { text };
  }

  async generateProgramSummary(
    input: GenerateProgramSummaryInput
  ): Promise<GenerateProgramSummaryOutput> {
    const prompt = buildProgramSummaryPrompt(input);
    const systemMessage =
      "Você é um assistente especializado em análise de programas de Nutrição em grupo. Gere resumos profissionais, objetivos e baseados em dados reais.";

    const text = await callOpenAI(prompt, systemMessage);
    return { text };
  }
}

