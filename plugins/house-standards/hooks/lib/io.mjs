import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { taskCommand } from "./rules.mjs";

const JUSTFILE_NAMES = ["justfile", "Justfile", ".justfile"];
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024;

// A hook that crashes must not block Claude, so every script fails open.
export function runHook(main) {
  main().catch(() => process.exit(0));
}

export async function readInput() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return JSON.parse(data);
}

export function emit(output) {
  process.stdout.write(JSON.stringify(output));
}

export function git(args, cwd) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

export function repoPath(root, cwd, filePath) {
  const path = relative(root, resolve(cwd, filePath)).split(sep).join("/");
  return path.startsWith("..") || /^[a-zA-Z]:/.test(path) ? null : path;
}

function repoFacts(root) {
  const packageJsonPath = join(root, "package.json");
  const packageJson = existsSync(packageJsonPath) ? JSON.parse(readFileSync(packageJsonPath, "utf8")) : null;
  const hasJustfile = JUSTFILE_NAMES.some((name) => existsSync(join(root, name)));
  let justRecipes = [];
  if (hasJustfile) {
    try {
      justRecipes = execFileSync("just", ["--summary"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split(/\s+/);
    } catch {
      justRecipes = [];
    }
  }
  return { packageJson, lockfiles: readdirSync(root), justRecipes };
}

// Returns null when the repo defines no command for the task.
export function runTask(root, task, args) {
  const command = taskCommand(task, repoFacts(root), args, process.platform);
  if (!command) return null;
  const result = spawnSync(command, { cwd: root, shell: true, encoding: "utf8", maxBuffer: MAX_OUTPUT_BYTES });
  return { ok: result.status === 0, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}
