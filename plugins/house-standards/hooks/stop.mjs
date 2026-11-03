import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lastLines, MAX_STOP_RETRIES, stopVerdict, TASKS } from "./lib/rules.mjs";
import { emit, git, readInput, runHook, runTask } from "./lib/io.mjs";

runHook(async () => {
  const { cwd, session_id: sessionId } = await readInput();
  const root = git(["rev-parse", "--show-toplevel"], cwd);
  if (!root || !git(["status", "--porcelain"], root)) return;
  const result = runTask(root, TASKS.checkChanged, []);
  if (!result) return;

  const counterFile = join(tmpdir(), `house-standards-stop-${String(sessionId).replace(/[^\w-]/g, "")}`);
  const verdict = stopVerdict({ passed: result.ok, previousFailures: readCount(counterFile) });
  if (verdict.failures === 0) rmSync(counterFile, { force: true });
  else writeFileSync(counterFile, String(verdict.failures));

  if (verdict.block) {
    emit({
      decision: "block",
      reason: `${TASKS.checkChanged.script} failed (attempt ${verdict.failures} of ${MAX_STOP_RETRIES}). Fix these before finishing:\n${lastLines(result.output)}`,
    });
  } else if (verdict.gaveUp) {
    emit({ systemMessage: `${TASKS.checkChanged.script} still fails after ${MAX_STOP_RETRIES} attempts. Stopping so you can look.` });
  }
});

function readCount(file) {
  try {
    return Number.parseInt(readFileSync(file, "utf8"), 10) || 0;
  } catch {
    return 0;
  }
}
