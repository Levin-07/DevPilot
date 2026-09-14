/**
 * File Filtering, Sanitization, and Security Detection
 * Phase 4: Codebase Import
 */

import path from "path";
import {
  IGNORED_DIRECTORIES,
  SECRET_FILE_NAMES,
  SECRET_EXTENSIONS,
  SECRET_CONTENT_PATTERNS,
  BINARY_AND_MEDIA_EXTENSIONS,
  EXTENSION_LANGUAGE_MAP,
  SPECIAL_FILENAMES,
} from "./constants";

/**
 * Normalizes an archive entry path and strictly rejects Zip Slip / path traversal attempts.
 * Returns null if the path is invalid, dangerous, or outside the root.
 */
export function normalizeSafePath(rawPath: string): string | null {
  if (!rawPath || typeof rawPath !== "string") {
    return null;
  }

  const trimmed = rawPath.trim();

  // Reject null byte injection
  if (trimmed.includes("\0")) {
    return null;
  }

  // Reject absolute paths starting with / or \
  if (trimmed.startsWith("/") || trimmed.startsWith("\\")) {
    return null;
  }

  // Reject Windows drive letters (e.g., C:\, D:/)
  if (/^[a-zA-Z]:[\\/]/.test(trimmed)) {
    return null;
  }

  // Convert all backslashes to forward slashes for uniform POSIX handling
  let sanitized = trimmed.replace(/\\/g, "/");

  // Strip leading dot-slashes if any (e.g., ./src/index.ts)
  sanitized = sanitized.replace(/^\.\/+/, "");

  // Normalize path resolution using POSIX
  const normalized = path.posix.normalize(sanitized);

  // Zip Slip / Directory Traversal Defense:
  // Reject any path that attempts to escape the root via ".."
  if (
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    normalized.endsWith("/..")
  ) {
    return null;
  }

  // Reject root slashes or empty result
  if (!normalized || normalized === "." || normalized.startsWith("/")) {
    return null;
  }

  return normalized;
}

/**
 * Checks whether any directory segment in the path belongs to the ignore list
 * (e.g. node_modules, .git, dist, build, coverage, etc.).
 */
export function isIgnoredPath(normalizedPath: string): boolean {
  const parts = normalizedPath.split("/").filter(Boolean);

  // Check if any directory segment is in the ignore set
  for (let i = 0; i < parts.length - 1; i++) {
    const dir = parts[i].toLowerCase();
    if (IGNORED_DIRECTORIES.has(dir) || dir.startsWith(".git")) {
      return true;
    }
  }

  // Also check top-level directory or file
  const baseName = parts[parts.length - 1]?.toLowerCase() || "";
  if (baseName === ".ds_store" || baseName === "thumbs.db") {
    return true;
  }

  return false;
}

/**
 * Checks whether a file is a secret or configuration file containing private credentials.
 */
export function isSecretOrSensitiveFile(normalizedPath: string, content?: string): boolean {
  const filename = path.posix.basename(normalizedPath).toLowerCase();
  const ext = getFileExtension(filename);

  // Check exact secret filenames
  if (SECRET_FILE_NAMES.has(filename)) {
    return true;
  }

  // Check .env variations (.env.staging, .env.prod.local, etc.)
  if (filename.startsWith(".env") || filename.endsWith(".env")) {
    return true;
  }

  // Check secret extensions (.pem, .key, .pfx, etc.)
  if (SECRET_EXTENSIONS.has(ext)) {
    return true;
  }

  // Check file content for sensitive private keys and API tokens if content provided
  if (content && typeof content === "string") {
    for (const pattern of SECRET_CONTENT_PATTERNS) {
      if (pattern.test(content)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks whether an extension belongs to the binary/media blacklist.
 */
export function isBinaryOrMediaFile(normalizedPath: string): boolean {
  const filename = path.posix.basename(normalizedPath).toLowerCase();
  const ext = getFileExtension(filename);
  return BINARY_AND_MEDIA_EXTENSIONS.has(ext);
}

/**
 * Inspects buffer content for null bytes or control characters to detect binary data,
 * preventing binary files disguised with source extensions from being stored.
 */
export function isBinaryBuffer(buffer: Buffer): boolean {
  // Check up to the first 4096 bytes
  const bytesToCheck = Math.min(buffer.length, 4096);
  if (bytesToCheck === 0) return false;

  let nullBytes = 0;
  for (let i = 0; i < bytesToCheck; i++) {
    if (buffer[i] === 0) {
      nullBytes++;
      // Even a single null byte in the first 4KB of a text file is almost certainly binary
      if (nullBytes > 0) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extracts normalized file extension (without dot).
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length <= 1) return "";
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Checks if the file is a recognized source or documentation file based on extension or special name.
 */
export function isSupportedSourceFile(normalizedPath: string): boolean {
  const filename = path.posix.basename(normalizedPath).toLowerCase();
  const ext = getFileExtension(filename);

  if (SPECIAL_FILENAMES[filename]) {
    return true;
  }

  if (ext && EXTENSION_LANGUAGE_MAP[ext]) {
    return true;
  }

  return false;
}
