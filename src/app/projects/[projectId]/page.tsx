import React from "react";
import Link from "next/link";
import {
  UploadCloud,
  Sparkles,
  BarChart3,
  GitBranch,
  ArrowLeft,
  ShieldAlert,
  FileCode,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { getProjectById } from "@/actions/projects";
import { ProjectDetailsHeader } from "@/components/projects/ProjectDetailsHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const result = await getProjectById(projectId);

  if (!result.success || !result.project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Project Not Accessible</h1>
        <p className="mt-2 max-w-md text-xs text-slate-400 leading-relaxed">
          {result.error ||
            "This project either does not exist or you do not have authorization to view it."}
        </p>
        <div className="mt-6">
          <Link href="/projects">
            <Button variant="outline" className="border-slate-800 text-slate-300 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const project = result.project;

  return (
    <div className="space-y-8 pb-12">
      {/* Project Header with Edit / Delete Modals */}
      <ProjectDetailsHeader project={project} />

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs font-mono text-slate-400">Indexed Files</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {project._count?.files ?? 0}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">files</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs font-mono text-slate-400">Code Chunks</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {project._count?.chunks ?? 0}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">chunks</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs font-mono text-slate-400">Vector Embeddings</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400">
              {project._count?.chunks ?? 0}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">vectors</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs font-mono text-slate-400">Project Status</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-400 font-mono uppercase">
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Future Modules Section (UI Placeholders) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Project Modules</h2>
          <p className="text-xs text-slate-400">
            Workspaces and intelligence pipelines configured for this codebase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Module 1: Codebase & ZIP Ingestion */}
          <Card className="border-slate-800/80 bg-slate-900/40 hover:border-slate-700 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant="default" className="font-mono text-[10px] px-2 py-0.5">
                Milestone 4 Next
              </Badge>
            </div>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <UploadCloud className="h-5 w-5" />
              </div>
              <CardTitle className="text-base text-white">Codebase & File Ingestion</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Upload repository ZIP archives, extract code hierarchies, and filter irrelevant paths.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 text-xs text-slate-400 font-mono space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Schema Models Ready: ProjectFile & CodeChunk</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Cascading Deletion Enabled</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module 2: AI Assistant & RAG */}
          <Card className="border-slate-800/80 bg-slate-900/40 hover:border-slate-700 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5">
                Milestone 5
              </Badge>
            </div>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-base text-white">AI Assistant & Semantic Search</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Ask natural-language questions about this repository with vector context and line citations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 text-xs text-slate-400 font-mono space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>pgvector Extension Active (v0.8.6)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>PostgreSQL 16 Vector Tables Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module 3: Code Analytics */}
          <Card className="border-slate-800/80 bg-slate-900/40 hover:border-slate-700 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5">
                Planned
              </Badge>
            </div>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                <BarChart3 className="h-5 w-5" />
              </div>
              <CardTitle className="text-base text-white">Codebase Analytics</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Token distributions, language composition, chunk health, and complexity graphs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 text-xs text-slate-400 font-mono">
                Telemetry will populate upon repository indexing.
              </div>
            </CardContent>
          </Card>

          {/* Module 4: GitHub Integration */}
          <Card className="border-slate-800/80 bg-slate-900/40 hover:border-slate-700 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5">
                Planned
              </Badge>
            </div>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700 mb-2">
                <GitBranch className="h-5 w-5" />
              </div>
              <CardTitle className="text-base text-white">GitHub Synchronization</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Direct branch synchronization, automatic commit indexing, and webhook triggers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 text-xs text-slate-400 font-mono">
                Repository sync integration planned for post-foundation phase.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
