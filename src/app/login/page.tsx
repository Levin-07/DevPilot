"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Terminal,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const justRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setErrorMessage("Invalid email address or password. Please try again.");
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            DevPilot
          </span>
        </Link>
        <p className="text-xs text-slate-400 font-mono">
          AI-Powered Developer Workspace
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-slate-800/90 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-white">
            Sign in to DevPilot
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Enter your credentials to access your codebase workspace
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {justRegistered && !errorMessage && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Account created successfully! Please sign in with your credentials.
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-300"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 py-2.5 text-sm font-medium"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="text-center text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Create one now
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-12">
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
