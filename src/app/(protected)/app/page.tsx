import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Pacientes</CardTitle>
            <CardDescription className="text-slate-400">Total de pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">0</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Consultas</CardTitle>
            <CardDescription className="text-slate-400">Consultas este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">0</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Programas</CardTitle>
            <CardDescription className="text-slate-400">Programas ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

