import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";

export default function PatientsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Pacientes</h1>
        <Button className="bg-primary hover:bg-primary/90">Novo Paciente</Button>
      </div>
      <Card className="bg-white/5 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Lista de Pacientes</CardTitle>
          <CardDescription className="text-slate-400">
            Gerencie seus pacientes aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Nenhum paciente cadastrado ainda.</p>
        </CardContent>
      </Card>
    </div>
  );
}

