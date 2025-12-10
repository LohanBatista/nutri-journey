"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Nutri Journey
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8">
            Plataforma profissional para gestão de pacientes e consultas
            nutricionais
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Uma solução completa e moderna para nutricionistas gerenciarem seus
            pacientes, programas nutricionais e acompanhamentos de forma
            eficiente e organizada.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg">Entrar</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline">
                Criar Conta
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
