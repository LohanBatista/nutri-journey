import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>
      <Card className="bg-white/5 backdrop-blur-md border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Configurações</CardTitle>
          <CardDescription className="text-slate-400">
            Gerencie suas configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Configurações em breve.</p>
        </CardContent>
      </Card>
    </div>
  );
}

