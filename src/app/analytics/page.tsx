import React from "react";
import { BarChart3, LineChart, Code2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Repository Analytics</h1>
          <p className="text-sm text-slate-400">
            Insights on codebase distribution, complexity, and vector cluster health.
          </p>
        </div>
        <Badge variant="outline" className="font-mono">Planned</Badge>
      </div>

      <Card className="border-slate-800 bg-slate-900/40 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
          <BarChart3 className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-white">Code Intelligence Analytics</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Once codebases are parsed and indexed, this section will provide detailed metrics on language breakdown, chunk density, and query performance.
        </p>
      </Card>
    </div>
  );
}
