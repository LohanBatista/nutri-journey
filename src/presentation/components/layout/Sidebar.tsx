"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useUIStore } from "../../stores/ui-store";

const navigation = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Pacientes", href: "/app/patients", icon: Users },
  { name: "Programas", href: "/app/programs", icon: Calendar },
  { name: "Relatórios", href: "/app/reports", icon: FileText },
  { name: "Configurações", href: "/app/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white/5 backdrop-blur-lg border-r border-white/10 z-50 transition-all duration-300",
        !sidebarOpen && "-translate-x-full"
      )}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-8">Nutri Journey</h2>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );
}

