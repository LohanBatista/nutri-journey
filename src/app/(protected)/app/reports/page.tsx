import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Relatórios</h1>
      <Card className="bg-white/5 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Relatórios</CardTitle>
          <CardDescription className="text-slate-400">
            Visualize relatórios e estatísticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Nenhum relatório disponível ainda.</p>
        </CardContent>
      </Card>
    </div>
  );
}

