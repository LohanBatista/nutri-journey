"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SessionSync } from "../providers/SessionSync";
import { motion } from "framer-motion";

export function AppLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <SessionSync />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card/50 backdrop-blur-lg border border-border rounded-2xl shadow-lg p-6 min-h-[calc(100vh-8rem)]"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
