import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    // Total de pacientes
    const totalPatients = await prisma.patient.count({
      where: { organizationId },
    });

    // Consultas deste mês
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const consultationsThisMonth = await prisma.consultation.count({
      where: {
        organizationId,
        dateTime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Programas ativos
    const activePrograms = await prisma.program.count({
      where: {
        organizationId,
        status: "ACTIVE",
      },
    });

    // Consultas por período
    const period = searchParams.get("consultationsPeriod") || "6months";
    const consultationsByPeriod = [];

    if (period === "7days") {
      // Últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

        const count = await prisma.consultation.count({
          where: {
            organizationId,
            dateTime: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        consultationsByPeriod.push({
          label: `${date.getDate()}/${date.getMonth() + 1}`,
          count,
        });
      }
    } else if (period === "30days") {
      // Últimos 30 dias (agrupado por 5 dias)
      for (let i = 5; i >= 0; i--) {
        const periodStart = new Date(now);
        periodStart.setDate(periodStart.getDate() - (i * 5 + 4));
        periodStart.setHours(0, 0, 0, 0);
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() - (i * 5));
        periodEnd.setHours(23, 59, 59, 999);

        const count = await prisma.consultation.count({
          where: {
            organizationId,
            dateTime: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        });

        const startDay = periodStart.getDate();
        const startMonth = periodStart.getMonth() + 1;
        const endDay = periodEnd.getDate();
        const endMonth = periodEnd.getMonth() + 1;

        consultationsByPeriod.push({
          label: `${startDay}/${startMonth}-${endDay}/${endMonth}`,
          count,
        });
      }
    } else if (period === "3months") {
      // Últimos 3 meses
      for (let i = 2; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const count = await prisma.consultation.count({
          where: {
            organizationId,
            dateTime: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        const monthNames = [
          "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
          "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        ];

        consultationsByPeriod.push({
          label: monthNames[date.getMonth()],
          count,
        });
      }
    } else {
      // Últimos 6 meses (padrão)
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const count = await prisma.consultation.count({
          where: {
            organizationId,
            dateTime: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        const monthNames = [
          "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
          "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        ];

        consultationsByPeriod.push({
          label: monthNames[date.getMonth()],
          count,
        });
      }
    }

    // Distribuição de pacientes por sexo
    const patientsBySex = await prisma.patient.groupBy({
      by: ["sex"],
      where: { organizationId },
      _count: true,
    });

    const sexDistribution = patientsBySex.map((item) => ({
      name: item.sex === "MALE" ? "Masculino" : item.sex === "FEMALE" ? "Feminino" : "Outro",
      value: item._count,
    }));

    // Status dos programas
    const programsByStatus = await prisma.program.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: true,
    });

    const programStatus = programsByStatus.map((item) => ({
      name: item.status === "PLANNED" ? "Planejados" : item.status === "ACTIVE" ? "Ativos" : "Finalizados",
      value: item._count,
    }));

    return NextResponse.json({
      totalPatients,
      consultationsThisMonth,
      activePrograms,
      consultationsByPeriod,
      sexDistribution,
      programStatus,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

