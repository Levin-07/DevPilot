"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileArchive,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileCode,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CodebaseImporterProps {
  projectId: string;
  hasExistingFiles?: boolean;
  onImportSuccess?: () => void;
  onCancel?: () => void;
}

export function CodebaseImporter({
  projectId,
  hasExistingFiles = false,
  onImportSuccess,
  onCancel,
}: CodebaseImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    totalFiles: number;
    totalBytes: number;
    languages: Record<string, number>;
    skippedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccessResult(null);

    const isZip =
      selectedFile.name.toLowerCase().endsWith(".zip") ||
      selectedFile.type === "application/zip" ||
      selectedFile.type === "application/x-zip-compressed";

    if (!isZip) {
      setError("Please select a valid .zip archive file.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File exceeds the 50MB archive size limit.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulated smooth progress while waiting for network and server extraction
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const response = await fetch(`/api/projects/${projectId}/import`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to import codebase archive.");
      }

      setSuccessResult({
        totalFiles: data.totalFiles,
        totalBytes: data.totalBytes,
        languages: data.languages || {},
        skippedCount: data.skippedCount || 0,
      });

      if (onImportSuccess) {
        setTimeout(() => {
          onImportSuccess();
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during import.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setSuccessResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              {hasExistingFiles ? "Re-import Codebase (ZIP)" : "Import Codebase"}
            </h3>
            <Badge
              variant="outline"
              className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono text-[10px]"
            >
              Phase 4 Ready
            </Badge>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Upload your software project as a ZIP archive. DevPilot validates the archive, filters
            out build artifacts, binaries, and secrets, and indexes all relevant source files.
          </p>
        </div>

        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Security & Filtering Assurance Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-[11px] text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Zip Slip & path traversal defense</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-[11px] text-slate-300">
          <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>Auto-filters node_modules, .git & binaries</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 text-[11px] text-slate-300">
          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Strictly ignores .env & secrets</span>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      {!file && !successResult && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 md:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
              : "border-slate-800 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-950/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 shadow-lg shadow-indigo-500/5">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h4 className="text-sm font-semibold text-white">
            Click to upload or drag & drop ZIP archive
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Supports standard software repository archives up to 50MB
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="border-slate-800 text-[10px] font-mono text-slate-500">
              .zip archives only
            </Badge>
            <Badge variant="outline" className="border-slate-800 text-[10px] font-mono text-slate-500">
              max 50 MB
            </Badge>
          </div>
        </div>
      )}

      {/* Selected File Card */}
      {file && !successResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileArchive className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-semibold text-white">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {formatFileSize(file.size)} • ZIP Archive
                </p>
              </div>
            </div>

            {!uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  Extracting and filtering repository...
                </span>
                <span className="text-indigo-400">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!uploading && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Change File
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[130px] shadow-lg shadow-indigo-600/20"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : hasExistingFiles ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Replace Codebase
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Import Codebase
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Import Failed</p>
            <p className="leading-relaxed text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successResult && (
        <div className="space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Codebase Imported Successfully!
              </p>
              <p className="text-xs text-emerald-300/80 font-mono">
                {successResult.totalFiles} source files indexed ({formatFileSize(successResult.totalBytes)})
              </p>
            </div>
          </div>

          {/* Languages Breakdown */}
          {Object.keys(successResult.languages).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Object.entries(successResult.languages).map(([lang, count]) => (
                <Badge
                  key={lang}
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-950/40 text-emerald-300 font-mono text-[10px]"
                >
                  {lang}: {count}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <Button
              size="sm"
              onClick={handleReset}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
