import { checkCommand, checkEdit, isGenerated, protectedBranches } from "./lib/rules.mjs";
import { emit, git, readInput, repoPath, runHook } from "./lib/io.mjs";

const COMMAND_TOOLS = new Set(["Bash", "PowerShell"]);

runHook(async () => {
  const { cwd, tool_name: toolName, tool_input: toolInput } = await readInput();
  const verdict = COMMAND_TOOLS.has(toolName)
    ? commandVerdict(toolInput.command, cwd)
    : editVerdict(toolInput.file_path ?? toolInput.notebook_path, cwd);
  if (!verdict) return;
  emit({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: verdict.decision,
      permissionDecisionReason: verdict.reason,
    },
  });
});

function commandVerdict(command, cwd) {
  if (!command) return null;
  return checkCommand(command, {
    currentBranch: git(["rev-parse", "--abbrev-ref", "HEAD"], cwd),
    protectedBranches: protectedBranches(git(["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"], cwd)),
  });
}

function editVerdict(filePath, cwd) {
  const root = filePath && git(["rev-parse", "--show-toplevel"], cwd);
  const path = root && repoPath(root, cwd, filePath);
  if (!path) return null;
  return checkEdit(path, { generated: isGenerated(git(["check-attr", "linguist-generated", "--", path], root)) });
}
