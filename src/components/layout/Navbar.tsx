"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Terminal, Database, Bell, GitBranch, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/layout/UserMenu";

export function Navbar() {
  const pathname = usePathname();
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        if (data.database === "connected") {
          setDbStatus("connected");
          setLatency(data.latencyMs ?? 0);
        } else {
          setDbStatus("disconnected");
        }
      } catch {
        setDbStatus("disconnected");
      }
    }

    checkHealth();
  }, []);

  // Hide Navbar completely on auth pages (login & register)
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">
                DevPilot
              </span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0 font-mono">
                M3: Projects
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              AI Codebase Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Center / System Status Pill */}
      <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs">
        <Database className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-400 font-mono">PostgreSQL:</span>
        {dbStatus === "checking" && (
          <span className="inline-flex items-center gap-1.5 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Connecting...
          </span>
        )}
        {dbStatus === "connected" && (
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Connected {latency !== null && `(${latency}ms)`}
          </span>
        )}
        {dbStatus === "disconnected" && (
          <span className="inline-flex items-center gap-1.5 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Ready for Credentials
          </span>
        )}
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title="GitHub Repo"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
        <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </div>

        {/* Authenticated User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
