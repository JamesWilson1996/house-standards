// Pure rules behind the house-standards hooks. The hook scripts gather repo facts, call these and act on the verdict.
// Hooks give Claude fast feedback. CI and branch protection stay the gate: a command wrapped in `sh -c` slips past them.

// Each task is a package.json script or, in repos without one, a just recipe (recipe names can't contain ":").
export const TASKS = {
  lintFile: { script: "lint:file", recipe: "lint-file" },
  checkChanged: { script: "check:changed", recipe: "check-changed" },
};
export const MAX_STOP_RETRIES = 3;
export const DEFAULT_PROTECTED_BRANCHES = ["main", "master"];

const DECISION = { ask: "ask", deny: "deny" };
const GUARDRAIL_PATHS = [/^\.github\/workflows\//, /^\.claude\/settings\.json$/, /^\.gitattributes$/];
const NO_VERIFY_SUBCOMMANDS = new Set(["commit", "push", "merge", "rebase", "am", "cherry-pick", "revert", "pull"]);
const GIT_OPTIONS_WITH_VALUE = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"]);
const GENERATED_VALUES = new Set(["set", "true"]);
const SAFE_ARG = /^[\w@%+=:,./-]+$/;

// Options that take a value, so the value is never mistaken for a flag or a refspec.
const ARG_SPECS = {
  commit: {
    short: new Set(["m", "F", "C", "c", "t"]),
    long: new Set(["--message", "--file", "--author", "--date", "--reuse-message", "--reedit-message", "--fixup", "--squash", "--template", "--cleanup", "--trailer"]),
  },
  merge: { short: new Set(["m", "F", "s", "X"]), long: new Set(["--message", "--file", "--strategy", "--strategy-option"]) },
  push: { short: new Set(["o"]), long: new Set(["--push-option", "--repo", "--receive-pack", "--exec"]) },
};
const NO_VALUES = { short: new Set(), long: new Set() };

const deny = (reason) => ({ decision: DECISION.deny, reason });
const ask = (reason) => ({ decision: DECISION.ask, reason });

export function splitCommand(command) {
  const segments = [[]];
  let token = null;
  let quote = null;
  const endToken = () => {
    if (token !== null) segments.at(-1).push(token);
    token = null;
  };
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    if (quote) {
      if (c === quote) quote = null;
      else if (c === "\\" && quote === '"' && i + 1 < command.length) token += command[++i];
      else token += c;
    } else if (c === "'" || c === '"') {
      quote = c;
      token ??= "";
    } else if (c === "\\" && i + 1 < command.length) {
      token = (token ?? "") + command[++i];
    } else if (c === "\n" || "&|;".includes(c)) {
      endToken();
      if ((c === "&" || c === "|") && command[i + 1] === c) i++;
      segments.push([]);
    } else if (/\s/.test(c)) {
      endToken();
    } else {
      token = (token ?? "") + c;
    }
  }
  endToken();
  return segments.filter((segment) => segment.length > 0);
}

export function gitInvocations(command) {
  const invocations = [];
  for (const tokens of splitCommand(command)) {
    const gitIndex = tokens.findIndex((t) => /(^|[\\/])git(\.exe)?$/i.test(t));
    if (gitIndex === -1) continue;
    let i = gitIndex + 1;
    while (i < tokens.length && tokens[i].startsWith("-")) i += GIT_OPTIONS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
    if (i < tokens.length) invocations.push({ subcommand: tokens[i], args: tokens.slice(i + 1) });
  }
  return invocations;
}

// A short-option cluster such as -am ends at the first option that takes a value; the rest of it, or the next argument, is that value.
function parseArgs(args, spec) {
  const flags = new Set();
  const positionals = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      positionals.push(...args.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const [name] = arg.split("=");
      flags.add(name);
      if (spec.long.has(name) && !arg.includes("=")) i++;
    } else if (arg.startsWith("-") && arg.length > 1) {
      for (let j = 1; j < arg.length; j++) {
        flags.add(`-${arg[j]}`);
        if (spec.short.has(arg[j])) {
          if (j === arg.length - 1) i++;
          break;
        }
      }
    } else {
      positionals.push(arg);
    }
  }
  return { flags, positionals };
}

function pushDestination(refspec, currentBranch) {
  const target = refspec.replace(/^\+/, "").split(":").at(-1).replace(/^refs\/heads\//, "");
  return target === "HEAD" ? currentBranch : target;
}

export function checkCommand(command, { currentBranch, protectedBranches = DEFAULT_PROTECTED_BRANCHES }) {
  for (const { subcommand, args } of gitInvocations(command)) {
    const { flags, positionals } = parseArgs(args, ARG_SPECS[subcommand] ?? NO_VALUES);
    const skipsHooks = flags.has("--no-verify") || (subcommand === "commit" && flags.has("-n"));
    if (NO_VERIFY_SUBCOMMANDS.has(subcommand) && skipsHooks) {
      return deny("--no-verify skips the repo's git hooks. Run the command without it and fix what the hooks report.");
    }
    if (subcommand !== "push") continue;

    const [, ...refspecs] = positionals;
    if (flags.has("--force") || flags.has("-f") || refspecs.some((r) => r.startsWith("+"))) {
      return deny("A force push overwrites the remote branch. Use --force-with-lease, which refuses when the remote has commits you haven't fetched.");
    }
    if (flags.has("--all") || flags.has("--mirror")) {
      return ask(`This pushes every local branch, including ${protectedBranches.join(" and ")}.`);
    }
    const destinations = refspecs.length > 0 ? refspecs.map((r) => pushDestination(r, currentBranch)) : [currentBranch];
    const target = destinations.find((d) => protectedBranches.includes(d));
    if (target) return ask(`This pushes straight to ${target}. Changes to ${target} normally go through a pull request.`);
  }
  return null;
}

export function checkEdit(relativePath, { generated }) {
  const path = relativePath.replaceAll("\\", "/");
  if (generated) {
    return deny(`${path} is generated (marked linguist-generated in .gitattributes). Change its source and rerun the generator that writes it.`);
  }
  if (GUARDRAIL_PATHS.some((pattern) => pattern.test(path))) {
    return ask(`${path} controls CI or the agent guardrails.`);
  }
  return null;
}

// `git check-attr` prints "<path>: <attribute>: <value>", and the path may itself contain ": ".
export function isGenerated(checkAttrOutput) {
  if (!checkAttrOutput) return false;
  return GENERATED_VALUES.has(checkAttrOutput.slice(checkAttrOutput.lastIndexOf(": ") + 2).trim());
}

export function protectedBranches(originHead) {
  const fromOrigin = originHead?.replace(/^origin\//, "");
  return [...new Set([fromOrigin, ...DEFAULT_PROTECTED_BRANCHES].filter(Boolean))];
}

export function stopVerdict({ passed, previousFailures }) {
  if (passed) return { block: false, gaveUp: false, failures: 0 };
  const failures = previousFailures + 1;
  if (failures > MAX_STOP_RETRIES) return { block: false, gaveUp: true, failures: 0 };
  return { block: true, gaveUp: false, failures };
}

export function packageManager({ packageJson, lockfiles }) {
  const declared = packageJson.packageManager?.split("@")[0];
  if (declared) return declared;
  if (lockfiles.includes("pnpm-lock.yaml")) return "pnpm";
  if (lockfiles.includes("yarn.lock")) return "yarn";
  if (lockfiles.some((file) => file.startsWith("bun.lock"))) return "bun";
  return "npm";
}

function quoteArg(arg, platform) {
  if (SAFE_ARG.test(arg)) return arg;
  return platform === "win32" ? `"${arg.replaceAll('"', '""')}"` : `'${arg.replaceAll("'", "'\\''")}'`;
}

// npm needs `--` to pass arguments through to a script; pnpm, yarn and bun pass them as they are.
export function scriptCommand(manager, script, args, platform) {
  const extra = manager === "npm" && args.length > 0 ? ["--", ...args] : args;
  return [manager, "run", script, ...extra].map((arg) => quoteArg(arg, platform)).join(" ");
}

export function taskCommand(task, { packageJson, lockfiles, justRecipes }, args, platform) {
  if (packageJson?.scripts?.[task.script]) {
    return scriptCommand(packageManager({ packageJson, lockfiles }), task.script, args, platform);
  }
  if (justRecipes.includes(task.recipe)) return ["just", task.recipe, ...args].map((arg) => quoteArg(arg, platform)).join(" ");
  return null;
}

export function lastLines(text, count = 60) {
  return text.trimEnd().split(/\r?\n/).slice(-count).join("\n");
}
