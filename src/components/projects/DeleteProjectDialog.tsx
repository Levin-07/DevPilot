"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/actions/projects";

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
  };
  redirectToOverview?: boolean;
  onDeleted?: () => void;
}

export function DeleteProjectDialog({
  isOpen,
  onClose,
  project,
  redirectToOverview = false,
  onDeleted,
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await deleteProject(project.id);

      if (!res.success) {
        setError(res.error || "Failed to delete project");
        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      onClose();

      if (onDeleted) {
        onDeleted();
      }

      if (redirectToOverview) {
        router.push("/projects");
      }
      router.refresh();
    } catch {
      setError("An unexpected network error occurred while deleting.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl relative"
        role="alertdialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Delete Project</h2>
            <p className="text-xs text-slate-400">Irreversible Action</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              {project.name}
            </span>
            ?
          </p>
          <div className="rounded-lg border border-rose-950/60 bg-rose-950/20 p-3 text-[11px] text-rose-300/90 leading-relaxed">
            ⚠️ This will cascade-delete all associated source files, parsed code chunks,
            and vector embeddings stored in PostgreSQL.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-slate-800 hover:bg-slate-900 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete Project
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
