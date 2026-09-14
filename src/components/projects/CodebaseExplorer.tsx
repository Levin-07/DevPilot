"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Search,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Code2,
  Layers,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeViewer } from "./CodeViewer";
import { getProjectFileContent } from "@/actions/projects";

export interface ProjectFileMeta {
  id: string;
  filePath: string;
  relativePath: string;
  filename: string;
  extension: string;
  language: string | null;
  fileSize: number;
  createdAt: Date | string;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  file?: ProjectFileMeta;
  children: Record<string, TreeNode>;
}

interface CodebaseExplorerProps {
  projectId: string;
  files: ProjectFileMeta[];
  onReimportClick?: () => void;
}

export function CodebaseExplorer({
  projectId,
  files,
  onReimportClick,
}: CodebaseExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Build Hierarchical Tree Structure from File Paths
  const { rootTree, allFolderPaths, languagesCount } = useMemo(() => {
    const root: TreeNode = {
      name: "root",
      path: "",
      isFolder: true,
      children: {},
    };

    const folders = new Set<string>();
    const langs: Record<string, number> = {};

    files.forEach((file) => {
      const parts = file.filePath.split("/").filter(Boolean);
      let currentNode = root;
      let currentPath = "";

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isLast) {
          currentNode.children[part] = {
            name: part,
            path: currentPath,
            isFolder: false,
            file,
            children: {},
          };

          const lang = file.language || "Other";
          langs[lang] = (langs[lang] || 0) + 1;
        } else {
          folders.add(currentPath);
          if (!currentNode.children[part]) {
            currentNode.children[part] = {
              name: part,
              path: currentPath,
              isFolder: true,
              children: {},
            };
          }
          currentNode = currentNode.children[part];
        }
      }
    });

    return { rootTree: root, allFolderPaths: folders, languagesCount: langs };
  }, [files]);

  // Expand top-level folders by default and auto-select the first file (e.g. README.md or index)
  useEffect(() => {
    const initialExpanded = new Set<string>();
    allFolderPaths.forEach((f) => {
      // Expand top 2 levels by default
      if (f.split("/").length <= 2) {
        initialExpanded.add(f);
      }
    });
    setExpandedFolders(initialExpanded);

    // Default select priority: README.md -> first file
    if (files.length > 0 && !selectedFileId) {
      const readme = files.find((f) => f.filename.toLowerCase().startsWith("readme"));
      const target = readme || files[0];
      setSelectedFileId(target.id);
      loadContent(target.id);
    }
  }, [allFolderPaths, files]);

  const loadContent = async (fileId: string) => {
    setIsLoadingContent(true);
    try {
      const res = await getProjectFileContent(projectId, fileId);
      if (res.success && res.file) {
        setActiveFileContent(res.file.content);
      } else {
        setActiveFileContent("// Failed to load file content.");
      }
    } catch {
      setActiveFileContent("// Error retrieving file content.");
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleSelectFile = (file: ProjectFileMeta) => {
    if (file.id === selectedFileId) return;
    setSelectedFileId(file.id);
    loadContent(file.id);
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  };

  const selectedFile = useMemo(() => {
    return files.find((f) => f.id === selectedFileId) || null;
  }, [files, selectedFileId]);

  // Helper to render file icon based on type
  const getFileIcon = (filename: string, language: string | null) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "json") return <FileJson className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    if (ext === "md" || ext === "txt") return <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
    if (ext === "sql") return <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
    if (language) return <Code2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
    return <FileCode className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
  };

  // Render a tree node recursively
  const renderNode = (node: TreeNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const childrenKeys = Object.keys(node.children).sort((a, b) => {
      const childA = node.children[a];
      const childB = node.children[b];
      // Folders first, then files alphabetically
      if (childA.isFolder && !childB.isFolder) return -1;
      if (!childA.isFolder && childB.isFolder) return 1;
      return a.localeCompare(b);
    });

    if (node.isFolder) {
      if (!node.path) {
        // Root node: render all children
        return childrenKeys.map((key) => renderNode(node.children[key], 0));
      }

      // Check if folder contains matching search results
      if (searchQuery.trim()) {
        const hasMatchingChild = (n: TreeNode): boolean => {
          if (!n.isFolder) {
            return n.name.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return Object.values(n.children).some(hasMatchingChild);
        };

        if (!hasMatchingChild(node)) {
          return null;
        }
      }

      return (
        <div key={node.path} className="select-none">
          <div
            onClick={() => toggleFolder(node.path)}
            className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-800/60 cursor-pointer text-slate-300 hover:text-white transition-colors text-xs font-mono group"
            style={{ paddingLeft: `${Math.max(depth * 14 + 8, 8)}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
            )}

            {isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-indigo-400/80 shrink-0" />
            )}

            <span className="truncate">{node.name}</span>
          </div>

          {(isExpanded || searchQuery.trim().length > 0) && (
            <div>
              {childrenKeys.map((key) => renderNode(node.children[key], depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Leaf File Node
    if (
      searchQuery.trim() &&
      !node.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !node.path.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return null;
    }

    const isSelected = node.file?.id === selectedFileId;

    return (
      <div
        key={node.path}
        onClick={() => node.file && handleSelectFile(node.file)}
        className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer text-xs font-mono transition-colors ${
          isSelected
            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
            : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
        }`}
        style={{ paddingLeft: `${Math.max(depth * 14 + 8, 8)}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {getFileIcon(node.name, node.file?.language || null)}
          <span className="truncate">{node.name}</span>
        </div>

        {node.file?.language && (
          <span className="text-[10px] text-slate-500 font-mono shrink-0 pl-1">
            {node.file.extension}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Header & Languages Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>{files.length} Imported Files</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(languagesCount).map(([lang, count]) => (
              <Badge
                key={lang}
                variant="outline"
                className="border-slate-800 bg-slate-950 text-slate-400 font-mono text-[10px] px-2 py-0.5"
              >
                {lang} ({count})
              </Badge>
            ))}
          </div>
        </div>

        {onReimportClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReimportClick}
            className="border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 text-xs gap-1.5 h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
            Re-import ZIP
          </Button>
        )}
      </div>

      {/* Explorer Split Layout: Tree on Left, Code Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: File Tree Explorer */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex flex-col min-h-[500px] max-h-[750px]">
          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter files in project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>

          {/* Tree Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {renderNode(rootTree)}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8">
          {selectedFile ? (
            <CodeViewer
              filePath={selectedFile.filePath}
              language={selectedFile.language}
              fileSize={selectedFile.fileSize}
              content={activeFileContent}
              isLoading={isLoadingContent}
            />
          ) : (
            <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-500">
              <FileCode className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-xs font-mono">Select a file from the explorer to view its source code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
