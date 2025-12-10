"use client";

import { Sidebar } from "@/presentation/components/layout/Sidebar";
import { Topbar } from "@/presentation/components/layout/Topbar";
import { motion } from "framer-motion";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg p-6 min-h-[calc(100vh-8rem)]"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

