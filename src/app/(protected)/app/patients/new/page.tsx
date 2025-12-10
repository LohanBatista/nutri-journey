"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useCreatePatient } from "@/presentation/patients/hooks/useCreatePatient";
import { ArrowLeft } from "lucide-react";

const createPatientSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  dateOfBirth: z.string().min(1, "Data de nascimento é obrigatória"),
  sex: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Sexo é obrigatório",
  }),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

type CreatePatientFormData = z.infer<typeof createPatientSchema>;

export default function NewPatientPage() {
  const router = useRouter();
  const { createPatient, loading, error: createError } = useCreatePatient();

  const [formData, setFormData] = useState<CreatePatientFormData>({
    fullName: "",
    dateOfBirth: "",
    sex: "MALE",
    phone: "",
    email: "",
    tags: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    field: keyof CreatePatientFormData,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validationResult = createPatientSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      const tags = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      const dateOfBirth = new Date(formData.dateOfBirth);

      await createPatient({
        fullName: formData.fullName,
        dateOfBirth,
        sex: formData.sex,
        phone: formData.phone || null,
        email: formData.email || null,
        tags: tags.length > 0 ? tags : undefined,
        notes: formData.notes || null,
      });

      router.push("/app/patients");
    } catch (err) {
      console.error("Erro ao criar paciente:", err);
      setIsSubmitting(false);
    }
  };

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
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          Novo Paciente
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Dados do Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">
                    Nome Completo *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    placeholder="Digite o nome completo"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-400">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-white">
                    Data de Nascimento *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-400">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sex" className="text-white">
                    Sexo *
                  </Label>
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) =>
                      handleChange("sex", e.target.value as "MALE" | "FEMALE" | "OTHER")
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-white/5 border-white/10 text-white"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Feminino</option>
                    <option value="OTHER">Outro</option>
                  </select>
                  {errors.sex && (
                    <p className="text-sm text-red-400">{errors.sex}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-white">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-slate-400">
                    Separe as tags por vírgula
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">
                  Observações
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-white/5 border-white/10 text-white placeholder:text-slate-400 resize-none"
                  placeholder="Observações sobre o paciente..."
                />
              </div>

              {createError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                  {createError}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-slate-400 hover:text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isSubmitting || loading ? "Salvando..." : "Salvar Paciente"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

