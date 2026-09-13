"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Terminal,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateClient = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please provide a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      errors.password = "Password must contain at least one letter and one number.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateClient()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        } else {
          setGeneralError(data.error || "Registration failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      // Auto sign-in with newly registered credentials
      const signInResult = await signIn("credentials", {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setGeneralError("An unexpected network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-12">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

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

        {/* Registration Card */}
        <Card className="border-slate-800/90 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-white">
              Create an account
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Start indexing and understanding your software projects
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {generalError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {isSuccess && (
                <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Account created successfully! Authenticating...</span>
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-medium text-slate-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Developer"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading || isSuccess}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.name}</p>
                )}
              </div>

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
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="developer@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading || isSuccess}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Min. 8 characters (letter + number)"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading || isSuccess}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-400">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-medium text-slate-300"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading || isSuccess}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-400">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 py-2.5 text-sm font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="text-center text-xs text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
