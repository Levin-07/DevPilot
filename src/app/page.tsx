"use client";

import React, { useEffect, useState } from "react";
import {
  FolderGit2,
  FileCode2,
  Binary,
  Database,
  ArrowRight,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [healthData, setHealthData] = useState<{
    status: string;
    database: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealthData(data);
    } catch {
      setHealthData({
        status: "offline",
        database: "disconnected",
        error: "Failed to connect to /api/health",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Milestone 1 • Foundation Initialized</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              DevPilot Developer Workspace
            </h1>
            <p className="max-w-2xl text-sm text-slate-400 leading-relaxed">
              AI-powered codebase intelligence workspace. DevPilot ingests your
              repositories, splits code into meaningful chunks, embeds them via pgvector,
              and enables context-grounded architectural exploration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="glow" className="gap-2 cursor-pointer shadow-indigo-500/20">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <Card className="bg-slate-900/40 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Projects
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <FolderGit2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <p className="text-xs text-slate-400 mt-1">Ready for first repository</p>
          </CardContent>
        </Card>

        {/* Indexed Files */}
        <Card className="bg-slate-900/40 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Indexed Files
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileCode2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <p className="text-xs text-slate-400 mt-1">Pending file extraction</p>
          </CardContent>
        </Card>

        {/* Vector Chunks */}
        <Card className="bg-slate-900/40 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Vector Chunks
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Binary className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white font-mono">0</div>
            <p className="text-xs text-slate-400 mt-1">pgvector 1536-dim ready</p>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card className="bg-slate-900/40 border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              PostgreSQL
            </CardTitle>
            <button
              onClick={checkHealth}
              disabled={isChecking}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Test Connection"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {healthData?.database === "connected" ? (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-lg font-bold text-emerald-400">Connected</span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({healthData.latencyMs}ms)
                  </span>
                </>
              ) : (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-base font-bold text-amber-400">Standby</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Ready for DB
                  </Badge>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {healthData?.database === "connected"
                ? "Prisma Client active & healthy"
                : "Configure .env or run docker compose"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Pipeline Architecture Interactive Overview */}
      <Card className="border-slate-800 bg-slate-900/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <CardTitle className="text-lg">AI Pipeline Architecture</CardTitle>
              </div>
              <CardDescription>
                How DevPilot transforms raw source repositories into context-grounded AI intelligence
              </CardDescription>
            </div>
            <Badge variant="default" className="font-mono text-xs">
              System Design
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {/* Step 1 */}
            <div className="group rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>01. INGEST</span>
                <span className="text-indigo-400">M2</span>
              </div>
              <h4 className="font-semibold text-white text-sm">Codebase ZIP</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Project upload with intelligent ignore filters (.git, node_modules, binaries).
              </p>
            </div>

            {/* Step 2 */}
            <div className="group rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>02. FILTER</span>
                <span className="text-indigo-400">M2</span>
              </div>
              <h4 className="font-semibold text-white text-sm">Source Extraction</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Language detection, SHA-256 hash tracking, and incremental diff detection.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>03. CHUNK</span>
                <span className="text-indigo-400">M3</span>
              </div>
              <h4 className="font-semibold text-white text-sm">AST Chunking</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Semantic block splitting preserving startLine, endLine, and code context.
              </p>
            </div>

            {/* Step 4 */}
            <div className="group rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>04. EMBED</span>
                <span className="text-indigo-400">M4</span>
              </div>
              <h4 className="font-semibold text-white text-sm">Vector Generation</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                High-dimensional OpenAI text-embedding-3-small vector representation.
              </p>
            </div>

            {/* Step 5 */}
            <div className="group rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>05. STORE</span>
                <span className="text-indigo-400">M4</span>
              </div>
              <h4 className="font-semibold text-white text-sm">pgvector Index</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                PostgreSQL HNSW/IVFFlat index for sub-10ms cosine similarity queries.
              </p>
            </div>

            {/* Step 6 */}
            <div className="group rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/40">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>06. RAG</span>
                <span className="text-indigo-400">M5</span>
              </div>
              <h4 className="font-semibold text-white text-sm">Grounding & QA</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Context-grounded LLM answers with exact file paths and line citations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Area & Milestone Roadmap */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Your Projects</h2>
              <p className="text-xs text-slate-400">Manage and analyze your software repositories</p>
            </div>
          </div>

          <Card className="border-dashed border-slate-800 bg-slate-900/20 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Projects Registered</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              Milestone 1 establishes the database schema for projects, files, and chunks.
              In Milestone 2, you will be able to upload repository ZIP files directly.
            </p>
            <div className="mt-5">
              <Button variant="outline" className="gap-2 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Create First Project (Milestone 2)
              </Button>
            </div>
          </Card>
        </div>

        {/* Milestone Tracker (1 col) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Development Roadmap</h2>
            <p className="text-xs text-slate-400">Incremental implementation status</p>
          </div>

          <Card className="border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Milestone 1: Project Foundation</div>
                  <div className="text-slate-400 text-[11px]">
                    Next.js, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL schema & layout.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Milestone 2: Codebase Upload & Parsing</div>
                  <div className="text-slate-400 text-[11px]">
                    ZIP upload handler, file filtering, language extraction, project persistence.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-400">Milestone 3: Chunking Engine</div>
                  <div className="text-slate-400 text-[11px]">
                    AST-aware chunker preserving function boundaries and line numbering.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-400">Milestone 4: Vector Embeddings & pgvector</div>
                  <div className="text-slate-400 text-[11px]">
                    OpenAI embedding generation and pgvector similarity index.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-400">Milestone 5: AI Chat & Context Retrieval</div>
                  <div className="text-slate-400 text-[11px]">
                    RAG pipeline with source file and line citation generation.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
