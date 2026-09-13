import React from "react";
import { Sparkles, MessageSquare, Bot } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Assistant</h1>
          <p className="text-sm text-slate-400">
            Query your indexed codebase with context-aware semantic retrieval.
          </p>
        </div>
        <Badge variant="default" className="font-mono">Milestone 5</Badge>
      </div>

      <Card className="border-slate-800 bg-slate-900/40 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
          <Bot className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-white">Semantic AI Assistant Workspace</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          This workspace will interface with your vector-indexed codebase. It will retrieve relevant code chunks with exact file and line references to produce grounded LLM answers.
        </p>
        <div className="mt-6">
          <Badge variant="outline" className="font-mono text-xs">
            Awaiting Milestones 2-4 (Upload, Chunking, Embeddings)
          </Badge>
        </div>
      </Card>
    </div>
  );
}
