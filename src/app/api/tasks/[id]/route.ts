import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeUpdateTaskStatusUseCase } from "@/application/factories/makeUpdateTaskStatusUseCase";

const updateTaskStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.professional || !session?.organization) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTaskStatusSchema.parse(body);

    const updateTaskStatusUseCase = makeUpdateTaskStatusUseCase();
    const result = await updateTaskStatusUseCase.execute({
      id,
      organizationId: session.organization.id,
      status: validatedData.status,
    });

    return NextResponse.json({
      task: {
        ...result.task,
        dueDate: result.task.dueDate ? result.task.dueDate.toISOString() : null,
        createdAt: result.task.createdAt.toISOString(),
        updatedAt: result.task.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Tarefa não encontrada") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Erro ao atualizar status da tarefa:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status da tarefa" },
      { status: 500 }
    );
  }
}
