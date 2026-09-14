/**
 * Source File Metadata & Language Detection
 * Phase 4: Codebase Import
 */

import path from "path";
import crypto from "crypto";
import { EXTENSION_LANGUAGE_MAP, SPECIAL_FILENAMES } from "./constants";
import { getFileExtension } from "./filter";

export interface FileMetadata {
  filename: string;
  extension: string;
  language: string | null;
  fileHash: string;
  fileSize: number;
}

/**
 * Resolves programming language and file metadata from normalized path and content.
 */
export function detectFileMetadata(normalizedPath: string, buffer: Buffer): FileMetadata {
  const filename = path.posix.basename(normalizedPath);
  const lowerName = filename.toLowerCase();
  const ext = getFileExtension(lowerName);

  let language: string | null = null;

  if (SPECIAL_FILENAMES[lowerName]) {
    language = SPECIAL_FILENAMES[lowerName];
  } else if (ext && EXTENSION_LANGUAGE_MAP[ext]) {
    language = EXTENSION_LANGUAGE_MAP[ext];
  }

  // Calculate SHA-256 checksum for content integrity and deduplication
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    filename,
    extension: ext,
    language,
    fileHash: hash,
    fileSize: buffer.length,
  };
}
