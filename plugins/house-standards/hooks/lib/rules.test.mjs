import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkCommand,
  checkEdit,
  isGenerated,
  lastLines,
  MAX_STOP_RETRIES,
  packageManager,
  protectedBranches,
  scriptCommand,
  stopVerdict,
  taskCommand,
  TASKS,
} from "./rules.mjs";

const onFeature = { currentBranch: "feature/x", protectedBranches: ["main", "master"] };
const onMain = { ...onFeature, currentBranch: "main" };
const decisionOf = (command, facts = onFeature) => checkCommand(command, facts)?.decision ?? "allow";

test("force pushes are denied", () => {
  for (const command of ["git push --force origin feature/x", "git push -f", "git push -fu origin feature/x", "git push origin +feature/x"]) {
    assert.equal(decisionOf(command), "deny", command);
  }
});

test("a lease-guarded force push is allowed", () => {
  assert.equal(decisionOf("git push --force-with-lease origin feature/x"), "allow");
  assert.equal(decisionOf("git push --force-with-lease=feature/x --force-if-includes"), "allow");
});

test("skipping git hooks is denied", () => {
  for (const command of ['git commit --no-verify -m "x"', 'git commit -nm "x"', "git push --no-verify", "git merge --no-verify main"]) {
    assert.equal(decisionOf(command), "deny", command);
  }
});

test("a commit message that mentions a flag is allowed", () => {
  assert.equal(decisionOf('git commit -m "-n means dry run"'), "allow");
  assert.equal(decisionOf('git commit -am "drop --no-verify from docs"'), "allow");
});

test("pushing to a protected branch asks first", () => {
  for (const command of ["git push origin main", "git push origin HEAD:main", "git push origin feature/x:refs/heads/master", "git -C repo push origin main", "cd repo && git push origin main", "git push origin --delete main", "git push --all"]) {
    assert.equal(decisionOf(command), "ask", command);
  }
  assert.equal(decisionOf("git push", onMain), "ask");
  assert.equal(decisionOf("git push -u origin HEAD", onMain), "ask");
});

test("pushing a feature branch is allowed", () => {
  assert.equal(decisionOf("git push"), "allow");
  assert.equal(decisionOf("git push -u origin feature/x", onMain), "allow");
  assert.equal(decisionOf("git push -o ci.skip origin feature/x"), "allow");
});

test("text that only mentions git is allowed", () => {
  assert.equal(decisionOf('echo "git push --force"'), "allow");
  assert.equal(decisionOf("git log --oneline | grep force"), "allow");
});

test("generated files cannot be edited", () => {
  assert.equal(checkEdit("src/routeTree.gen.ts", { generated: true }).decision, "deny");
});

test("CI and guardrail files ask first", () => {
  for (const path of [".github/workflows/ci.yml", ".github\\workflows\\ci.yml", ".claude/settings.json", ".gitattributes"]) {
    assert.equal(checkEdit(path, { generated: false })?.decision, "ask", path);
  }
});

test("ordinary files are editable", () => {
  assert.equal(checkEdit("src/orders/cancel-order.ts", { generated: false }), null);
  assert.equal(checkEdit(".claude/settings.local.json", { generated: false }), null);
});

test("check-attr output is read from its last field", () => {
  assert.equal(isGenerated("src/routeTree.gen.ts: linguist-generated: set"), true);
  assert.equal(isGenerated("src/odd: name.ts: linguist-generated: true"), true);
  assert.equal(isGenerated("src/a.ts: linguist-generated: unspecified"), false);
  assert.equal(isGenerated(null), false);
});

test("the origin default branch joins main and master as protected", () => {
  assert.deepEqual(protectedBranches("origin/trunk"), ["trunk", "main", "master"]);
  assert.deepEqual(protectedBranches("origin/main"), ["main", "master"]);
  assert.deepEqual(protectedBranches(null), ["main", "master"]);
});

test("the stop check blocks until it passes or runs out of retries", () => {
  assert.deepEqual(stopVerdict({ passed: true, previousFailures: 2 }), { block: false, gaveUp: false, failures: 0 });
  assert.deepEqual(stopVerdict({ passed: false, previousFailures: 0 }), { block: true, gaveUp: false, failures: 1 });
  assert.deepEqual(stopVerdict({ passed: false, previousFailures: MAX_STOP_RETRIES - 1 }), { block: true, gaveUp: false, failures: MAX_STOP_RETRIES });
  assert.deepEqual(stopVerdict({ passed: false, previousFailures: MAX_STOP_RETRIES }), { block: false, gaveUp: true, failures: 0 });
});

test("the package manager comes from packageManager, then the lockfile", () => {
  assert.equal(packageManager({ packageJson: { packageManager: "pnpm@9.12.0" }, lockfiles: ["yarn.lock"] }), "pnpm");
  assert.equal(packageManager({ packageJson: {}, lockfiles: ["yarn.lock"] }), "yarn");
  assert.equal(packageManager({ packageJson: {}, lockfiles: ["bun.lockb"] }), "bun");
  assert.equal(packageManager({ packageJson: {}, lockfiles: [] }), "npm");
});

test("script commands pass arguments the way each package manager expects", () => {
  assert.equal(scriptCommand("npm", "lint:file", ["src/a.ts"], "linux"), "npm run lint:file -- src/a.ts");
  assert.equal(scriptCommand("npm", "check:changed", [], "linux"), "npm run check:changed");
  assert.equal(scriptCommand("pnpm", "lint:file", ["src/a b.ts"], "win32"), 'pnpm run lint:file "src/a b.ts"');
  assert.equal(scriptCommand("pnpm", "lint:file", ["src/it's.ts"], "linux"), "pnpm run lint:file 'src/it'\\''s.ts'");
});

test("a task runs the package.json script first, then the just recipe", () => {
  const node = { packageJson: { scripts: { "lint:file": "biome check --write" } }, lockfiles: ["pnpm-lock.yaml"], justRecipes: ["lint-file"] };
  const python = { packageJson: null, lockfiles: [], justRecipes: ["lint-file", "check-changed"] };
  assert.equal(taskCommand(TASKS.lintFile, node, ["src/a.ts"], "linux"), "pnpm run lint:file src/a.ts");
  assert.equal(taskCommand(TASKS.lintFile, python, ["apps/api/main.py"], "linux"), "just lint-file apps/api/main.py");
  assert.equal(taskCommand(TASKS.checkChanged, { ...python, justRecipes: [] }, [], "linux"), null);
});

test("long output is cut to its last lines", () => {
  assert.equal(lastLines("a\nb\nc\n", 2), "b\nc");
});
