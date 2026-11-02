import { lastLines, TASKS } from "./lib/rules.mjs";
import { emit, git, readInput, repoPath, runHook, runTask } from "./lib/io.mjs";

runHook(async () => {
  const { cwd, tool_input: toolInput } = await readInput();
  const root = toolInput.file_path && git(["rev-parse", "--show-toplevel"], cwd);
  const path = root && repoPath(root, cwd, toolInput.file_path);
  if (!path) return;
  const result = runTask(root, TASKS.lintFile, [path]);
  if (result && !result.ok) {
    emit({ decision: "block", reason: `${TASKS.lintFile.script} reported problems in ${path}:\n${lastLines(result.output)}` });
  }
});
