"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Nutri Journey
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8">
            Plataforma profissional para gestão de pacientes e consultas
            nutricionais
          </p>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Uma solução completa e moderna para nutricionistas gerenciarem seus
            pacientes, programas nutricionais e acompanhamentos de forma
            eficiente e organizada.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Criar Conta
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
