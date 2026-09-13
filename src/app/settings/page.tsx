import React from "react";
import { Settings, Shield, Key, Sliders, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-slate-400">
          Configure DevPilot environment, AI credentials, and database settings.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Database Configuration Card */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-base">Database Configuration</CardTitle>
            </div>
            <CardDescription>
              PostgreSQL connection string and pgvector extension status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Target Schema:</span>
              <span className="text-slate-200">public</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Prisma Client:</span>
              <Badge variant="success" className="font-mono text-[10px]">Active (v6.19.3)</Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Settings */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-base">AI Engine Settings</CardTitle>
            </div>
            <CardDescription>
              OpenAI API credentials and embedding model configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Embedding Model:</span>
              <span className="text-indigo-300">text-embedding-3-small (1536d)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Reasoning Model:</span>
              <span className="text-indigo-300">gpt-4o-mini / gpt-4o</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
