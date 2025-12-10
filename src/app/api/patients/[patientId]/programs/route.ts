import { NextRequest, NextResponse } from "next/server";
import { makeGetProgramUseCase } from "@/application/factories/makeGetProgramUseCase";
import { PrismaProgramParticipantRepository } from "@/infra/repositories/PrismaProgramParticipantRepository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    const participantRepository = new PrismaProgramParticipantRepository();
    const participants = await participantRepository.findByPatientId(patientId);

    // Buscar os programas de cada participante
    const getProgramUseCase = makeGetProgramUseCase();
    const programs = await Promise.all(
      participants
        .filter((p) => !p.leaveDate) // Apenas participantes ativos
        .map(async (participant) => {
          try {
            const result = await getProgramUseCase.execute({
              id: participant.programId,
              organizationId,
            });
            return result.program;
          } catch (error) {
            console.error(
              `Erro ao buscar programa ${participant.programId}:`,
              error
            );
            return null;
          }
        })
    );

    // Filtrar programas nulos e adicionar informações do participante
    const programsWithParticipantInfo = programs
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map((program) => {
        const participant = participants.find(
          (p) => p.programId === program.id && !p.leaveDate
        );
        return {
          ...program,
          participantInfo: participant
            ? {
                joinDate: participant.joinDate,
                notes: participant.notes,
              }
            : null,
        };
      });

    return NextResponse.json({
      programs: programsWithParticipantInfo,
    });
  } catch (error) {
    console.error("Erro ao buscar programas do paciente:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

