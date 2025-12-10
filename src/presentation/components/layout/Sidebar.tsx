"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useUIStore } from "../../stores/ui-store";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Pacientes", href: "/app/patients", icon: Users },
  { name: "Programas", href: "/app/programs", icon: Calendar },
  { name: "Relatórios", href: "/app/reports", icon: FileText },
  { name: "Configurações", href: "/app/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const sidebarExpanded = useUIStore((state) => state.sidebarExpanded);
  const sidebarMobileOpen = useUIStore((state) => state.sidebarMobileOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setSidebarMobileOpen = useUIStore((state) => state.setSidebarMobileOpen);

  return (
    <>
      {/* Overlay para mobile */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarExpanded ? 256 : 80,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
          "fixed lg:sticky left-0 top-0 h-screen bg-card/80 backdrop-blur-lg border-r border-border z-50 transition-all duration-300 flex-shrink-0 overflow-hidden",
          "lg:translate-x-0",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-border">
            <AnimatePresence mode="wait">
              {sidebarExpanded ? (
                <motion.h2
                  key="title-expanded"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold text-foreground whitespace-nowrap overflow-hidden"
                >
                  Nutri Journey
                </motion.h2>
              ) : (
                <motion.div
                  key="title-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"
                >
                  <span className="text-primary font-bold text-sm">N</span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              className="lg:flex hidden"
              onClick={toggleSidebar}
              title={sidebarExpanded ? "Colapsar menu" : "Expandir menu"}
            >
              {sidebarExpanded ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarMobileOpen(false)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Fechar sidebar em mobile ao clicar em um link
                    if (window.innerWidth < 1024) {
                      setSidebarMobileOpen(false);
                    }
                  }}
                  className={cn(
                    "flex items-center rounded-lg transition-all duration-200 relative group",
                    sidebarExpanded ? "gap-3 px-4 py-3" : "justify-center px-3 py-3",
                    isActive
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                  title={!sidebarExpanded ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Tooltip quando colapsado */}
                  {!sidebarExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-border shadow-lg">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>
    </>
  );
}

