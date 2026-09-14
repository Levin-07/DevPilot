/**
 * Core Codebase Ingestion Service
 * Phase 4: Codebase Import
 */

import JSZip from "jszip";
import prisma from "@/lib/prisma";
import {
  MAX_ZIP_SIZE,
  MAX_UNCOMPRESSED_TOTAL,
  MAX_FILE_SIZE,
  MAX_FILE_COUNT,
  MAX_COMPRESSION_RATIO,
} from "./constants";
import {
  normalizeSafePath,
  isIgnoredPath,
  isSecretOrSensitiveFile,
  isBinaryOrMediaFile,
  isBinaryBuffer,
  isSupportedSourceFile,
} from "./filter";
import { detectFileMetadata } from "./detector";

export interface IngestedFileInfo {
  filePath: string;
  relativePath: string;
  filename: string;
  extension: string;
  language: string | null;
  fileSize: number;
  content: string;
  fileHash: string;
}

export interface IngestionResult {
  success: boolean;
  message: string;
  totalFiles: number;
  totalBytes: number;
  languages: Record<string, number>;
  skippedCount: number;
}

/**
 * Validates, securely extracts, filters, and ingests a repository ZIP archive.
 * Replaces any existing codebase for the project in an atomic database transaction.
 */
export async function processZipArchive(
  projectId: string,
  userId: string,
  zipBuffer: Buffer
): Promise<IngestionResult> {
  // 1. Enforce strict tenant ownership verification
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    throw new Error("Project not found or you do not have permission to modify it.");
  }

  // 2. Validate compressed archive size
  if (zipBuffer.length > MAX_ZIP_SIZE) {
    throw new Error(
      `Archive exceeds the maximum allowed size of ${MAX_ZIP_SIZE / (1024 * 1024)}MB.`
    );
  }

  // 3. Load archive purely in-memory using JSZip
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(zipBuffer);
  } catch {
    throw new Error("The uploaded file is not a valid or readable ZIP archive.");
  }

  const entries = Object.values(zip.files);

  // 4. Protect against Zip Bombs / Entry Exhaustion
  if (entries.length > MAX_FILE_COUNT) {
    throw new Error(
      `Archive contains too many entries (${entries.length}). Maximum supported is ${MAX_FILE_COUNT} files.`
    );
  }

  const filesToIngest: IngestedFileInfo[] = [];
  const languageStats: Record<string, number> = {};
  let totalUncompressedBytes = 0;
  let skippedCount = 0;

  // Track root folder stripping if entire zip is wrapped in a single top-level directory
  // (common when downloading GitHub repository zips, e.g. "repo-main/src/...")
  const allEntryPaths = entries.map((e) => e.name.replace(/\\/g, "/"));
  const nonDirPaths = allEntryPaths.filter((p) => !p.endsWith("/"));
  let commonPrefix = "";

  if (nonDirPaths.length > 0) {
    const firstSlash = nonDirPaths[0].indexOf("/");
    if (firstSlash !== -1) {
      const candidatePrefix = nonDirPaths[0].substring(0, firstSlash + 1);
      const allSharePrefix = nonDirPaths.every((p) => p.startsWith(candidatePrefix));
      if (allSharePrefix) {
        commonPrefix = candidatePrefix;
      }
    }
  }

  // 5. Inspect and extract each entry safely
  for (const entry of entries) {
    // Skip directories
    if (entry.dir || entry.name.endsWith("/") || entry.name.endsWith("\\")) {
      continue;
    }

    // Strip top-level wrapper folder if present
    let rawPath = entry.name;
    if (commonPrefix && rawPath.startsWith(commonPrefix)) {
      rawPath = rawPath.substring(commonPrefix.length);
    }

    // Zip Slip / Directory Traversal Defense: Normalize and validate path
    const safePath = normalizeSafePath(rawPath);
    if (!safePath) {
      // Unsafe path or path traversal detected - discard immediately
      skippedCount++;
      continue;
    }

    // Check directory blacklist (node_modules, .git, dist, build, coverage, etc.)
    if (isIgnoredPath(safePath)) {
      skippedCount++;
      continue;
    }

    // Check secret / config file blacklist (.env, .env.local, keys, certs)
    if (isSecretOrSensitiveFile(safePath)) {
      skippedCount++;
      continue;
    }

    // Check binary / media file blacklist (.png, .mp4, .exe, nested .zip, etc.)
    if (isBinaryOrMediaFile(safePath)) {
      skippedCount++;
      continue;
    }

    // Check source allowlist (.ts, .py, .go, .rs, .md, .sql, etc.)
    if (!isSupportedSourceFile(safePath)) {
      skippedCount++;
      continue;
    }

    // Read content buffer safely in memory
    const buffer = await entry.async("nodebuffer");

    // Guard against oversized individual files (e.g. minified bundles)
    if (buffer.length > MAX_FILE_SIZE) {
      skippedCount++;
      continue;
    }

    totalUncompressedBytes += buffer.length;

    // Guard against total uncompressed explosion (Zip Bomb)
    if (totalUncompressedBytes > MAX_UNCOMPRESSED_TOTAL) {
      throw new Error(
        `Total uncompressed size exceeds limit of ${MAX_UNCOMPRESSED_TOTAL / (1024 * 1024)}MB.`
      );
    }

    // Guard against excessive compression ratio
    if (zipBuffer.length > 0 && totalUncompressedBytes / zipBuffer.length > MAX_COMPRESSION_RATIO) {
      throw new Error("Decompression bomb detected: archive compression ratio exceeds security limits.");
    }

    // Inspect buffer for binary null-byte patterns (disguised binaries)
    if (isBinaryBuffer(buffer)) {
      skippedCount++;
      continue;
    }

    // Safe UTF-8 decoding
    const content = buffer.toString("utf-8");

    // Re-verify content for secret tokens or private keys
    if (isSecretOrSensitiveFile(safePath, content)) {
      skippedCount++;
      continue;
    }

    // Extract file metadata and language
    const meta = detectFileMetadata(safePath, buffer);

    filesToIngest.push({
      filePath: safePath,
      relativePath: safePath,
      filename: meta.filename,
      extension: meta.extension,
      language: meta.language,
      fileSize: meta.fileSize,
      content,
      fileHash: meta.fileHash,
    });

    const lang = meta.language || "Other";
    languageStats[lang] = (languageStats[lang] || 0) + 1;
  }

  // 6. Ensure at least one valid source file was extracted
  if (filesToIngest.length === 0) {
    throw new Error(
      "No valid source code files found in archive. Ensure your ZIP contains supported source files (.ts, .js, .py, .go, .rs, .md, etc.) and is not exclusively binary, ignored, or empty."
    );
  }

  // 7. Atomic Database Transaction: Replace existing project files
  await prisma.$transaction(async (tx) => {
    // Mark status as PROCESSING
    await tx.project.update({
      where: { id: projectId },
      data: { status: "PROCESSING" },
    });

    // Delete existing project files (cascades to CodeChunks automatically)
    await tx.projectFile.deleteMany({
      where: { projectId },
    });

    // Bulk insert new files in batches of 200 for database efficiency
    const batchSize = 200;
    for (let i = 0; i < filesToIngest.length; i += batchSize) {
      const batch = filesToIngest.slice(i, i + batchSize);
      await tx.projectFile.createMany({
        data: batch.map((f) => ({
          projectId,
          filePath: f.filePath,
          relativePath: f.relativePath,
          filename: f.filename,
          extension: f.extension,
          language: f.language,
          fileSize: f.fileSize,
          content: f.content,
          fileHash: f.fileHash,
        })),
      });
    }

    // Mark status as INDEXED upon successful ingestion
    await tx.project.update({
      where: { id: projectId },
      data: {
        status: "INDEXED",
        updatedAt: new Date(),
      },
    });
  });

  return {
    success: true,
    message: `Successfully imported ${filesToIngest.length} source files across ${Object.keys(languageStats).length} languages.`,
    totalFiles: filesToIngest.length,
    totalBytes: totalUncompressedBytes,
    languages: languageStats,
    skippedCount,
  };
}
