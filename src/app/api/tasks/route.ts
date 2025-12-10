import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/presentation/auth/config";
import { makeCreateTaskUseCase } from "@/application/factories/makeCreateTaskUseCase";
import { makeListTasksUseCase } from "@/application/factories/makeListTasksUseCase";

const createTaskSchema = z.object({
  organizationId: z.string().uuid(),
  professionalId: z.string().uuid(),
  patientId: z.string().uuid().nullable().optional(),
  programId: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().nullable().optional(),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "null") return true;
        // Aceita formato ISO completo ou formato datetime-local (YYYY-MM-DDTHH:mm)
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
        const localRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        return isoRegex.test(val) || localRegex.test(val);
      },
      {
        message: "Data inválida. Use o formato YYYY-MM-DDTHH:mm ou ISO 8601",
      }
    ),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.professional || !session?.organization) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Verificar se o professionalId corresponde ao usuário autenticado
    if (validatedData.professionalId !== session.professional.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    // Verificar se a organização corresponde
    if (validatedData.organizationId !== session.organization.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    // Converter dueDate para Date se fornecido
    let dueDate: Date | null = null;
    if (validatedData.dueDate && validatedData.dueDate !== "null") {
      // Se o formato for YYYY-MM-DDTHH:mm (datetime-local), adicionar segundos
      const dateStr = validatedData.dueDate;
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) {
        dueDate = new Date(dateStr + ":00");
      } else {
        dueDate = new Date(dateStr);
      }
      
      // Validar se a data é válida
      if (isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { error: "Data de vencimento inválida" },
          { status: 400 }
        );
      }
    }

    const input: {
      organizationId: string;
      professionalId: string;
      patientId?: string | null;
      programId?: string | null;
      title: string;
      description?: string | null;
      dueDate?: Date | null;
      status?: "PENDING" | "IN_PROGRESS" | "DONE";
    } = {
      organizationId: validatedData.organizationId,
      professionalId: validatedData.professionalId,
      title: validatedData.title,
    };

    if (validatedData.patientId !== undefined) {
      input.patientId = validatedData.patientId;
    }

    if (validatedData.programId !== undefined) {
      input.programId = validatedData.programId;
    }

    if (validatedData.description !== undefined) {
      input.description = validatedData.description;
    }

    if (dueDate !== undefined) {
      input.dueDate = dueDate;
    }

    if (validatedData.status !== undefined) {
      input.status = validatedData.status;
    }

    const createTaskUseCase = makeCreateTaskUseCase();
    const result = await createTaskUseCase.execute(input);

    return NextResponse.json(
      {
        task: {
          ...result.task,
          dueDate: result.task.dueDate
            ? result.task.dueDate.toISOString()
            : null,
          createdAt: result.task.createdAt.toISOString(),
          updatedAt: result.task.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json(
      { error: "Erro ao criar tarefa" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.professional || !session?.organization) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const patientId = searchParams.get("patientId");
    const programId = searchParams.get("programId");
    const professionalId = searchParams.get("professionalId");

    const listTasksUseCase = makeListTasksUseCase();
    const result = await listTasksUseCase.execute({
      organizationId: session.organization.id,
      filters: {
        ...(status && { status: status as "PENDING" | "IN_PROGRESS" | "DONE" }),
        ...(patientId && { patientId }),
        ...(programId && { programId }),
        ...(professionalId && { professionalId }),
      },
    });

    return NextResponse.json({
      tasks: result.tasks.map((task) => ({
        ...task,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    return NextResponse.json(
      { error: "Erro ao listar tarefas" },
      { status: 500 }
    );
  }
}

