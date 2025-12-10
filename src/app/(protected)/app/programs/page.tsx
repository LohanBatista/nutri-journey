import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";

export default function ProgramsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Programas</h1>
      <Card className="bg-white/5 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Programas Nutricionais</CardTitle>
          <CardDescription className="text-slate-400">
            Gerencie seus programas nutricionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Nenhum programa criado ainda.</p>
        </CardContent>
      </Card>
    </div>
  );
}

