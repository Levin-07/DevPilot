"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, FolderPlus, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createProject } from "@/actions/projects";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
}

export function CreateProjectDialog({
  isOpen,
  onClose,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await createProject({
        name: trimmedName,
        description: description.trim() || undefined,
      });

      if (!res.success || !res.project) {
        setError(res.error || "Failed to create project");
        setIsSubmitting(false);
        return;
      }

      setName("");
      setDescription("");
      setIsSubmitting(false);
      onClose();

      if (onProjectCreated) {
        onProjectCreated();
      }

      router.push(`/projects/${res.project.id}`);
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
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FolderPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Create New Project</h2>
            <p className="text-xs text-slate-400">
              Initialize a workspace for codebase analysis and indexing
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
          {/* Project Name */}
          <div className="space-y-1.5">
            <label htmlFor="projectName" className="text-xs font-medium text-slate-300">
              Project Name <span className="text-indigo-400">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              required
              autoFocus
              placeholder="e.g., E-Commerce Microservices"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="projectDesc" className="text-xs font-medium text-slate-300">
              Description <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="projectDesc"
              rows={3}
              placeholder="Brief summary of this codebase architecture and purpose..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none disabled:opacity-50"
            />
          </div>

          {/* Dialog Actions */}
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
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
