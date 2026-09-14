"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CodebaseImporter } from "./CodebaseImporter";
import { CodebaseExplorer, ProjectFileMeta } from "./CodebaseExplorer";

interface ProjectCodebaseSectionProps {
  projectId: string;
  files: ProjectFileMeta[];
}

export function ProjectCodebaseSection({
  projectId,
  files,
}: ProjectCodebaseSectionProps) {
  const [showImporter, setShowImporter] = useState(files.length === 0);
  const router = useRouter();

  const handleSuccess = () => {
    setShowImporter(false);
    router.refresh();
  };

  if (showImporter) {
    return (
      <div className="space-y-4">
        <CodebaseImporter
          projectId={projectId}
          hasExistingFiles={files.length > 0}
          onImportSuccess={handleSuccess}
          onCancel={files.length > 0 ? () => setShowImporter(false) : undefined}
        />
        {files.length > 0 && (
          <div className="pt-2 text-right">
            <button
              onClick={() => setShowImporter(false)}
              className="text-xs text-slate-400 hover:text-white underline font-mono"
            >
              Return to Codebase Explorer
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <CodebaseExplorer
      projectId={projectId}
      files={files}
      onReimportClick={() => setShowImporter(true)}
    />
  );
}
