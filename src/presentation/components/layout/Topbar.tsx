"use client";

import { Button } from "../ui/button";
import { LogOut, User, Menu, Sun, Moon } from "lucide-react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useUIStore } from "../../stores/ui-store";
import { useThemeStore } from "../../stores/theme-store";

export function Topbar() {
  const { data: session } = useSession();
  const professional = session?.professional;
  const organization = session?.organization;
  const setSidebarMobileOpen = useUIStore((state) => state.setSidebarMobileOpen);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarMobileOpen(true)}
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          {organization && (
            <div>
              <p className="text-sm text-muted-foreground">Organização</p>
              <p className="font-medium text-foreground">{organization.name}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {professional && (
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">Profissional</p>
              <p className="font-medium text-foreground">{professional.name}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Alternar para tema claro" : "Alternar para tema escuro"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
            <User className="w-5 h-5 text-foreground" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

