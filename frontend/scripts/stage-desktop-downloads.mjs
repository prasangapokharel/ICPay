#!/usr/bin/env node
/**
 * Copy repo-root /downloads into public/downloads for static serving.
 * Never use a symlink — Vercel fails with "Cannot copy to a subdirectory of itself".
 * On CI the source folder is usually absent (gitignored); build continues without binaries.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, rmSync } from "node:fs"
import { join } from "node:path"

const frontendRoot = join(import.meta.dirname, "..")
const dest = join(frontendRoot, "public", "downloads")
const src = join(frontendRoot, "..", "downloads")

if (existsSync(dest)) {
  const stat = lstatSync(dest)
  if (stat.isSymbolicLink()) {
    rmSync(dest)
  } else {
    rmSync(dest, { recursive: true, force: true })
  }
}

if (!existsSync(src)) {
  console.log("Skipping desktop downloads (repo /downloads not present)")
  process.exit(0)
}

cpSync(src, dest, { recursive: true })
console.log("Staged desktop downloads into frontend/public/downloads")
