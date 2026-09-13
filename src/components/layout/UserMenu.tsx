"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  User as UserIcon,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
        <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />
        <div className="hidden lg:flex flex-col gap-1">
          <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
          <div className="h-2 w-12 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
        <Link
          href="/login"
          className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const name = session.user.name || "Developer";
  const email = session.user.email || "";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "DP";

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-lg p-1.5 pl-2 border-l border-slate-800 hover:bg-slate-900/60 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-xs font-bold text-white shadow-sm shadow-indigo-500/30">
          {initials}
        </div>
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-medium text-slate-200 line-clamp-1 max-w-[120px]">
            {name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono line-clamp-1 max-w-[120px]">
            {email}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header Info */}
          <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{name}</span>
              <Badge variant="default" className="text-[9px] px-1.5 py-0 font-mono">
                Active
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
              {email}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              <span>Account & Settings</span>
            </Link>

            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Authenticated Session</span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-slate-800/80" />

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-50 text-left"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
