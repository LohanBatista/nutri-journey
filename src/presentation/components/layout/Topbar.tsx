"use client";

import { Button } from "../ui/button";
import { LogOut, User } from "lucide-react";
import { useSessionStore } from "../../stores/session-store";
import { motion } from "framer-motion";

export function Topbar() {
  const { professional, organization } = useSessionStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-white/5 backdrop-blur-lg border-b border-white/10"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {organization && (
            <div>
              <p className="text-sm text-slate-400">Organização</p>
              <p className="text-white font-medium">{organization.name}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {professional && (
            <div className="text-right">
              <p className="text-sm text-slate-400">Profissional</p>
              <p className="text-white font-medium">{professional.name}</p>
            </div>
          )}
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

