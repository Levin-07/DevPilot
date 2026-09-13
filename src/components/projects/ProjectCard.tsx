"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Calendar,
  Clock,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  FileCode,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";

export interface ProjectCardData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    files: number;
    chunks: number;
  };
}

interface ProjectCardProps {
  project: ProjectCardData;
  onRefresh?: () => void;
}

export function ProjectCard({ project, onRefresh }: ProjectCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const createdDate = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const updatedDate = new Date(project.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Card className="group relative flex flex-col justify-between border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition-all duration-200 shadow-lg hover:shadow-indigo-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600/20 to-cyan-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 transition-transform">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <div>
                <Link
                  href={`/projects/${project.id}`}
                  className="font-semibold text-white group-hover:text-indigo-300 transition-colors text-base line-clamp-1"
                >
                  {project.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 uppercase">
                    {project.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Project Options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-800 bg-slate-950 p-1 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowEdit(true);
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-colors text-left"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>Edit details</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDelete(true);
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <CardDescription className="text-xs text-slate-400 line-clamp-2 mt-2 min-h-[32px]">
            {project.description || "No description provided for this codebase."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Metadata counts */}
          <div className="flex items-center gap-4 rounded-lg bg-slate-950/60 p-2.5 text-xs text-slate-400 font-mono border border-slate-800/50">
            <div className="flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5 text-indigo-400" />
              <span>{project._count?.files ?? 0} files</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>{project._count?.chunks ?? 0} chunks</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex flex-col gap-0.5 text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-500" />
              Created: {createdDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" />
              Updated: {updatedDate}
            </span>
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-sans font-medium transition-colors group-hover:translate-x-0.5 duration-150"
          >
            <span>Open</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardFooter>
      </Card>

      <EditProjectDialog
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
        }}
        onUpdated={onRefresh}
      />

      <DeleteProjectDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        project={{
          id: project.id,
          name: project.name,
        }}
        onDeleted={onRefresh}
      />
    </>
  );
}
