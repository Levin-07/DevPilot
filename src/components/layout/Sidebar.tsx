"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  Sparkles,
  BarChart3,
  Settings,
  Layers,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "success" | "warning";
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderGit2,
    badge: "0",
    badgeVariant: "secondary",
  },
  {
    name: "AI Assistant",
    href: "/assistant",
    icon: Sparkles,
    badge: "M5",
    badgeVariant: "default",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    badge: "Planned",
    badgeVariant: "outline",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/60 p-4 justify-between backdrop-blur-md">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Navigation
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                    isActive
                      ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm"
                      : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-indigo-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant ?? "secondary"}
                      className="text-[10px] px-1.5 py-0 font-mono"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pipeline Architecture Indicator */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Pipeline Architecture</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Chunking &rarr; OpenAI Embeddings &rarr; pgvector &rarr; RAG
          </p>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-3/6 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Progress</span>
            <span className="text-cyan-400">Milestone 3 / 6</span>
          </div>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-[11px] text-slate-400 font-mono space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-sans font-medium text-xs">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span>DevPilot Environment</span>
        </div>
        <div className="flex justify-between">
          <span>Engine:</span>
          <span className="text-slate-300">Next.js 15+ / TS</span>
        </div>
        <div className="flex justify-between">
          <span>ORM:</span>
          <span className="text-slate-300">Prisma v6</span>
        </div>
        <div className="flex justify-between">
          <span>Vector:</span>
          <span className="text-slate-300">pgvector Ready</span>
        </div>
      </div>
    </aside>
  );
}
