/**
 * Ingestion Pipeline Configuration & Guardrail Constants
 * Phase 4: Codebase Import
 */

// Size & Resource Limits
export const MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB max uploaded archive
export const MAX_UNCOMPRESSED_TOTAL = 150 * 1024 * 1024; // 150MB total extracted size
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per individual file
export const MAX_FILE_COUNT = 2000; // 2,000 files maximum to avoid resource exhaustion
export const MAX_COMPRESSION_RATIO = 100; // Protection against decompression bombs (Zip Bombs)

/**
 * Ignored directories across standard programming environments,
 * build tools, package managers, and virtual environments.
 */
export const IGNORED_DIRECTORIES = new Set<string>([
  "node_modules",
  ".git",
  ".svn",
  ".hg",
  ".next",
  ".nuxt",
  "dist",
  "build",
  "out",
  "coverage",
  ".nyc_output",
  ".turbo",
  ".cache",
  "target",
  "bin",
  "obj",
  "vendor",
  "__pycache__",
  ".pytest_cache",
  ".venv",
  "venv",
  "env",
  ".idea",
  ".vscode",
  ".husky",
  ".github",
  ".gitlab",
]);

/**
 * Sensitive and secret file patterns that must NEVER be ingested or stored.
 */
export const SECRET_FILE_NAMES = new Set<string>([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  ".env.staging",
  ".env.example.local",
  "id_rsa",
  "id_dsa",
  "id_ed25519",
  "id_ecdsa",
  "credentials.json",
  "token.json",
  "tokens.json",
  "auth.json",
  "secret.json",
  "secrets.json",
  "service-account.json",
  "serviceaccountkey.json",
]);

/**
 * Sensitive file extensions associated with keys, certificates, and credentials.
 */
export const SECRET_EXTENSIONS = new Set<string>([
  "pem",
  "key",
  "pkcs12",
  "pfx",
  "p12",
  "crt",
  "cer",
  "der",
  "keystore",
  "jks",
]);

/**
 * High-confidence regex patterns identifying secrets inside source text.
 */
export const SECRET_CONTENT_PATTERNS = [
  /-----BEGIN\s+[A-Z0-9_-]*PRIVATE\s+KEY-----/i,
  /ghp_[a-zA-Z0-9]{36}/,
  /github_pat_[a-zA-Z0-9_]{82}/,
  /AKIA[0-9A-Z]{16}/,
  /AIza[0-9A-Za-z-_]{35}/,
  /sk_live_[0-9a-zA-Z]{24}/,
];

/**
 * Blacklisted non-source extensions (binaries, media, fonts, archives, documents).
 */
export const BINARY_AND_MEDIA_EXTENSIONS = new Set<string>([
  // Images
  "png", "jpg", "jpeg", "gif", "ico", "svg", "webp", "bmp", "tiff", "psd", "ai",
  // Videos & Audio
  "mp4", "mov", "avi", "mkv", "wmv", "flv", "webm", "mp3", "wav", "flac", "ogg", "m4a", "aac",
  // Executables & Native binaries
  "exe", "dll", "so", "dylib", "bin", "iso", "dmg", "app", "class", "jar", "war", "wasm",
  // Fonts
  "woff", "woff2", "ttf", "eot", "otf",
  // Archives
  "zip", "tar", "gz", "7z", "rar", "bz2", "xz", "tgz",
  // Documents & DBs
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "sqlite", "db",
]);

/**
 * Supported source and documentation file extensions mapped to canonical languages.
 */
export const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  // TypeScript & JavaScript
  ts: "TypeScript",
  tsx: "TypeScript",
  mts: "TypeScript",
  cts: "TypeScript",
  js: "JavaScript",
  jsx: "JavaScript",
  mjs: "JavaScript",
  cjs: "JavaScript",

  // Python
  py: "Python",
  pyw: "Python",

  // Systems & Compiled
  go: "Go",
  rs: "Rust",
  java: "Java",
  kt: "Kotlin",
  kts: "Kotlin",
  c: "C",
  cpp: "C++",
  cc: "C++",
  cxx: "C++",
  h: "C/C++ Header",
  hpp: "C++ Header",
  cs: "C#",

  // Web & Scripting
  html: "HTML",
  htm: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  less: "Less",
  php: "PHP",
  rb: "Ruby",
  swift: "Swift",
  dart: "Dart",
  scala: "Scala",
  sh: "Shell",
  bash: "Shell",
  zsh: "Shell",

  // Data, Query, & Config
  json: "JSON",
  md: "Markdown",
  markdown: "Markdown",
  mdx: "MDX",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  xml: "XML",
  sql: "SQL",
  graphql: "GraphQL",
  gql: "GraphQL",
  prisma: "Prisma",
};

/**
 * Well-known special filenames without traditional extensions.
 */
export const SPECIAL_FILENAMES: Record<string, string> = {
  dockerfile: "Docker",
  makefile: "Makefile",
  gemfile: "Ruby",
  cmakelists: "CMake",
};
