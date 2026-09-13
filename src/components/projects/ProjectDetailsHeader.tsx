"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Calendar,
  Clock,
  User,
  Edit2,
  Trash2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";

interface ProjectDetailsHeaderProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    user?: {
      name: string | null;
      email: string | null;
    } | null;
  };
}

export function ProjectDetailsHeader({ project }: ProjectDetailsHeaderProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const createdDate = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const updatedDate = new Date(project.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>

        {/* Header Content & Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-cyan-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg">
              <FolderGit2 className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {project.name}
                </h1>
                <Badge variant="default" className="text-xs font-mono uppercase px-2 py-0.5">
                  {project.status}
                </Badge>
                <Badge variant="outline" className="text-[11px] text-emerald-400 border-emerald-500/30 font-mono flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Owner Access
                </Badge>
              </div>

              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                {project.description || "No project description provided."}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Owner: {project.user?.name || project.user?.email || "Workspace User"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Created: {createdDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Updated: {updatedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0 self-start">
            <Button
              variant="outline"
              onClick={() => setShowEdit(true)}
              className="border-slate-800 hover:bg-slate-900 text-slate-300 gap-1.5 text-xs"
            >
              <Edit2 className="h-3.5 w-3.5 text-cyan-400" />
              Edit Details
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDelete(true)}
              className="border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Project
            </Button>
          </div>
        </div>
      </div>

      <EditProjectDialog
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
        }}
      />

      <DeleteProjectDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        project={{
          id: project.id,
          name: project.name,
        }}
        redirectToOverview={true}
      />
    </>
  );
}
