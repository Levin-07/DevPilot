"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit3, AlertCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProject } from "@/actions/projects";

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string | null;
  };
  onUpdated?: () => void;
}

export function EditProjectDialog({
  isOpen,
  onClose,
  project,
  onUpdated,
}: EditProjectDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(project.name);
    setDescription(project.description || "");
    setError(null);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Project name must be at least 2 characters.");
      return;
    }

    if (trimmedName.length > 60) {
      setError("Project name cannot exceed 60 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateProject(project.id, {
        name: trimmedName,
        description: description.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to update project");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();

      if (onUpdated) {
        onUpdated();
      }

      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Edit3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Edit Project Details</h2>
            <p className="text-xs text-slate-400">
              Update project identifier and descriptive metadata
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="editProjectName" className="text-xs font-medium text-slate-300">
              Project Name <span className="text-cyan-400">*</span>
            </label>
            <input
              id="editProjectName"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="editProjectDesc" className="text-xs font-medium text-slate-300">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="editProjectDesc"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-800 hover:bg-slate-900 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
