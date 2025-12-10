import type { ProgramRepository } from "@/domain/repositories/ProgramRepository";
import type { AiNutritionService } from "@/domain/ai/AiNutritionService";
import type { AiProgramSummaryRepository } from "@/domain/repositories/AiProgramSummaryRepository";
import type { AiProgramSummary, AiProgramSummaryType } from "@/domain/entities/AiProgramSummary";

export interface GenerateProgramSummaryInput {
  organizationId: string;
  programId: string;
  type: AiProgramSummaryType;
  meetingId?: string | null;
}

export interface GenerateProgramSummaryOutput {
  summary: AiProgramSummary;
}

export class GenerateProgramSummaryUseCase {
  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly aiNutritionService: AiNutritionService,
    private readonly aiProgramSummaryRepository: AiProgramSummaryRepository
  ) {}

  async execute(
    input: GenerateProgramSummaryInput
  ): Promise<GenerateProgramSummaryOutput> {
    // Buscar programa
    const program = await this.programRepository.findById(
      input.programId,
      input.organizationId
    );

    if (!program) {
      throw new Error("Programa não encontrado");
    }

    // Preparar dados para IA
    // Nota: Os nomes dos pacientes precisariam ser buscados do repositório de pacientes
    // Por enquanto, usamos IDs. O resumo da IA ainda será útil sem os nomes específicos
    const participants = (program.participants || []).map((p, idx) => ({
      id: p.patientId,
      name: `Participante ${idx + 1}`, // Simplificado - pode ser melhorado buscando do PatientRepository
      joinDate: p.joinDate,
    }));

    const meetings = (program.meetings || []).map((m) => {
      const recordsCount = m.records?.length || 0;
      return {
        id: m.id,
        date: m.date,
        topic: m.topic,
        notes: m.notes,
        participantsCount: recordsCount,
      };
    });

    // Calcular evolução média se houver registros
    let averageEvolution: {
      averageWeightChange: number | null;
      averageBmiChange: number | null;
      attendanceRate: number;
    } | null = null;

    if (meetings.length > 0 && program.meetings) {
      const allRecords = program.meetings.flatMap((m) => m.records || []);
      
      if (allRecords.length > 0) {
        // Calcular taxas de presença
        const totalPossibleAttendances = participants.length * meetings.length;
        const totalAttendances = allRecords.filter((r) => r.presence).length;
        const attendanceRate = totalPossibleAttendances > 0
          ? totalAttendances / totalPossibleAttendances
          : 0;

        // Calcular variações de peso/IMC (simplificado - primeira vs última)
        const weights = allRecords
          .filter((r) => r.weightKg !== null)
          .map((r) => r.weightKg!);
        
        const bmis = allRecords
          .filter((r) => r.bmi !== null)
          .map((r) => r.bmi!);

        let averageWeightChange: number | null = null;
        let averageBmiChange: number | null = null;

        if (weights.length >= 2) {
          // Simplificado: média das últimas - média das primeiras
          const firstHalf = weights.slice(0, Math.floor(weights.length / 2));
          const secondHalf = weights.slice(Math.floor(weights.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          averageWeightChange = secondAvg - firstAvg;
        }

        if (bmis.length >= 2) {
          const firstHalf = bmis.slice(0, Math.floor(bmis.length / 2));
          const secondHalf = bmis.slice(Math.floor(bmis.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          averageBmiChange = secondAvg - firstAvg;
        }

        averageEvolution = {
          averageWeightChange,
          averageBmiChange,
          attendanceRate,
        };
      }
    }

    // Extrair objetivos do programa (da descrição ou objetivos)
    const objectives = program.description || "Programa nutricional em grupo";

    // Filtrar encontros se for resumo de encontro específico
    let relevantMeetings = meetings;
    if (input.type === "MEETING_SUMMARY" && input.meetingId) {
      relevantMeetings = meetings.filter((m) => m.id === input.meetingId);
    }

    // Montar input para IA
    const aiInput = {
      program: {
        id: program.id,
        name: program.name,
        description: program.description,
        startDate: program.startDate,
        endDate: program.endDate,
        status: program.status,
      },
      objectives,
      participants,
      meetings: relevantMeetings,
      averageEvolution,
    };

    // Gerar resumo com IA
    const aiOutput = await this.aiNutritionService.generateProgramSummary(aiInput);

    // Salvar resumo
    const summary = await this.aiProgramSummaryRepository.create({
      organizationId: input.organizationId,
      programId: input.programId,
      type: input.type,
      meetingId: input.meetingId ?? null,
      text: aiOutput.text,
    });

    return { summary };
  }
}

