"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { usePatientNutritionReport } from "@/presentation/nutrition/hooks";
import { usePatient } from "@/presentation/patients/hooks/usePatient";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function PatientReportPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const router = useRouter();
  const { patientId } = use(params);
  const { patient, loading: patientLoading } = usePatient(patientId);
  const { generateReport, loading: reportLoading } =
    usePatientNutritionReport(patientId);
  const [report, setReport] = useState<{
    patientName: string;
    reportDate: Date;
    sections: { title: string; content: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const reportData = await generateReport();
        setReport(reportData);
      } catch (error) {
        console.error("Erro ao gerar relatório:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const handleExportPDF = () => {
    if (!report) return;

    // Criar conteúdo HTML para o PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório Nutricional - ${report.patientName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            h1 {
              color: #2563eb;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            h2 {
              color: #1e40af;
              margin-top: 30px;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .section {
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f9fafb;
              border-left: 4px solid #2563eb;
            }
            .content {
              white-space: pre-wrap;
              line-height: 1.6;
            }
            .header {
              margin-bottom: 40px;
            }
            .date {
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Nutricional</h1>
            <p><strong>Paciente:</strong> ${report.patientName}</p>
            <p class="date"><strong>Data do Relatório:</strong> ${new Date(
              report.reportDate
            ).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
          </div>
          ${report.sections
            .map(
              (section) => `
            <div class="section">
              <h2>${section.title}</h2>
              <div class="content">${section.content}</div>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    // Criar blob e abrir em nova janela para impressão
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }

    // Limpar URL após um tempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  if (patientLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Carregando relatório...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-400">Paciente não encontrado</div>
        <Button
          variant="ghost"
          onClick={() => router.push("/app/patients")}
          className="text-slate-400 hover:text-white hover:bg-white/10"
        >
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <h1 className="text-3xl font-bold text-white">Relatório Nutricional</h1>
          <p className="text-slate-400 mt-1">{patient.fullName}</p>
        </motion.div>
        {report && (
          <Button
            onClick={handleExportPDF}
            className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        )}
      </div>

      {reportLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-slate-400">Gerando relatório...</div>
        </div>
      ) : report && report.sections.length > 0 ? (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-white font-semibold">{report.patientName}</p>
                <p className="text-sm text-slate-400">
                  Relatório gerado em{" "}
                  {new Date(report.reportDate).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </motion.div>

          {report.sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-center">
              Não há dados suficientes para gerar o relatório.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

