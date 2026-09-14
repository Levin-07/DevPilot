"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode, FileText, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  filePath: string;
  language: string | null;
  fileSize: number;
  content: string;
  isLoading?: boolean;
}

export function CodeViewer({
  filePath,
  language,
  fileSize,
  content,
  isLoading = false,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const lines = content ? content.split("\n") : [];

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3" />
        <p className="text-xs font-mono text-slate-400">Loading file content...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl">
      {/* File Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-2.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {language ? <Code2 className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
          </div>
          <span className="truncate font-mono text-xs font-semibold text-slate-200">
            {filePath}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {language && (
            <Badge
              variant="outline"
              className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-mono text-[10px] px-2 py-0.5"
            >
              {language}
            </Badge>
          )}

          <Badge
            variant="outline"
            className="border-slate-800 bg-slate-900 text-slate-400 font-mono text-[10px] px-2 py-0.5"
          >
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </Badge>

          <Badge
            variant="outline"
            className="border-slate-800 bg-slate-900 text-slate-400 font-mono text-[10px] px-2 py-0.5"
          >
            {formatFileSize(fileSize)}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 border-slate-800 bg-slate-900/80 px-2.5 text-xs text-slate-300 hover:text-white hover:border-slate-700"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code Viewer Body with Line Numbers */}
      <div className="flex-1 overflow-auto font-mono text-xs leading-relaxed p-4 bg-slate-950">
        {lines.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-slate-500 italic">
            Empty file
          </div>
        ) : (
          <div className="min-w-full inline-block">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="group flex items-start hover:bg-slate-900/50 py-[1px] px-1 rounded-sm"
              >
                <span className="w-12 shrink-0 select-none text-right pr-4 font-mono text-[11px] text-slate-600 group-hover:text-slate-400">
                  {idx + 1}
                </span>
                <span className="flex-1 font-mono text-slate-200 whitespace-pre break-all selection:bg-indigo-600 selection:text-white">
                  {line || "\u00A0"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
