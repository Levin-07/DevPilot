"use client";

import React, { useState } from "react";
import {
  FolderGit2,
  Plus,
  Search,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCard, ProjectCardData } from "@/components/projects/ProjectCard";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";

interface ProjectsListProps {
  initialProjects: ProjectCardData[];
}

export function ProjectsList({ initialProjects }: ProjectsListProps) {
  const [projects, setProjects] = useState<ProjectCardData[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter projects by search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    (project.description &&
      project.description.toLowerCase().includes(searchQuery.toLowerCase().trim()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
            <Badge variant="default" className="text-xs font-mono px-2 py-0.5">
              {projects.length} {projects.length === 1 ? "Project" : "Projects"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your indexed software repositories and AI workspaces.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {/* Filter / Search Bar if projects exist */}
      {projects.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filter projects by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        /* Empty State: 0 projects total */
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 text-indigo-400 border border-indigo-500/20 mb-4 shadow-inner">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-semibold text-white">No projects found</h2>
          <p className="mx-auto mt-2 max-w-sm text-xs text-slate-400 leading-relaxed">
            You haven’t initialized any codebase projects yet. Create your first project to
            prepare for codebase ingestion and AI intelligence.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 gap-2"
            >
              <Plus className="h-4 w-4" />
              Create your first project
            </Button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty State: Filter matched nothing */
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-300 font-medium">
            No projects matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-500 mt-1">Try searching with a different term.</p>
        </div>
      ) : (
        /* Responsive Grid of Project Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRefresh={() => {
                // Next.js Server Action revalidation will refresh server data
              }}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
