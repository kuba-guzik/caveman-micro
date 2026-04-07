#!/usr/bin/env node

import { execSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getEncoding } from "js-tiktoken";

const enc = getEncoding("o200k_base");
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const RESULTS_DIR = join(ROOT, "bench", "results", "live");
const AGENTS_SKILLS_DIR = join(process.env.HOME || "", ".agents", "skills");

mkdirSync(RESULTS_DIR, { recursive: true });

const MODEL = process.env.BENCH_MODEL || "sonnet";
const REPS = Number.parseInt(process.env.BENCH_REPS || "3", 10);
const TASK_FILTER = process.env.BENCH_TASK || null;
const EXPERIMENT_FILTER = process.env.BENCH_EXPERIMENT || null;
const DRY_RUN = process.env.BENCH_DRY === "1";

function countTokens(text) {
  return enc.encode(text).length;
}

function round(value, digits = 1) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function avg(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPercent(delta, base) {
  if (base === 0) {
    return "N/A";
  }

  return `${round((delta / base) * 100, 1)}%`;
}

function readSkill(relativePath) {
  return readFileSync(join(AGENTS_SKILLS_DIR, relativePath), "utf8");
}

function ensureFixtures() {
  if (
    existsSync(join(ROOT, "bench", "fixtures", "logs", "server.log")) &&
    existsSync(join(ROOT, "bench", "fixtures", "docs", "runbook.md")) &&
    existsSync(join(ROOT, "bench", "fixtures", "src", "auth-service.ts"))
  ) {
    return;
  }

  execSync("node scripts/benchmark.mjs >/dev/null", {
    cwd: ROOT,
    encoding: "utf8",
    shell: "/bin/bash",
  });
}

function runShell(command) {
  return execSync(command, {
    cwd: ROOT,
    encoding: "utf8",
    shell: "/bin/bash",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

const skills = {
  tokenEfficiency: {
    id: "token-efficiency",
    label: "token-efficiency",
    content: readSkill("token-efficiency/SKILL.md"),
  },
  tokenEfficiencyMicro: {
    id: "token-efficiency-micro",
    label: "token-efficiency-micro",
    content: [
      "Default to token efficiency.",
      "- Read only relevant sections, not full files.",
      "- Search first with grep or rg, then inspect matching lines.",
      "- For logs, filter by error, warn, keywords, and recency before reading.",
      "- Extract only the lines needed for exact values.",
      "- Skip repeated noise and keep the answer short and high-signal.",
    ].join("\n"),
  },
  textOptimizer: {
    id: "text-optimizer",
    label: "text-optimizer",
    content: readSkill("text-optimizer/SKILL.md"),
  },
  textOptimizerMicro: {
    id: "text-optimizer-micro",
    label: "text-optimizer-micro",
    content: [
      "Default to compact prompting and answers.",
      "- Remove filler, repetition, and process narration.",
      "- Prefer one clear default over many options.",
      "- Keep the structure tight and task-focused.",
      "- Use short fields, compact bullets, and exact values.",
      "- Preserve required facts; compress wording, not content.",
    ].join("\n"),
  },
  caveman: {
    id: "caveman",
    label: "caveman",
    content: readSkill("caveman/SKILL.md"),
  },
  cavemanMicro: {
    id: "caveman-micro",
    label: "caveman-micro",
    content: [
      "Respond like smart caveman. Cut all filler, keep technical substance.",
      "- Drop articles (a, an, the), filler (just, really, basically, actually).",
      "- Drop pleasantries (sure, certainly, happy to).",
      "- No hedging. Fragments fine. Short synonyms.",
      "- Technical terms stay exact. Code blocks unchanged.",
      "- Pattern: [thing] [action] [reason]. [next step].",
    ].join("\n"),
  },
};

const tasks = [
  {
    id: "incident-diagnosis",
    title: "Incident Diagnosis",
    responseShape:
      'Return strict JSON only: {"primary_cause":"","fallback_cause":"","relevant_settings":[],"next_steps":[]}',
    prompts: {
      verbose:
        "I need you to carefully and thoroughly diagnose the login and session-refresh incident that we have been seeing in our production environment. Please take your time to analyze all of the available information that has been provided to you. When you explain the likely root cause of the issue, make sure to provide enough detail and context so that someone who is not already familiar with the system internals can understand what is going on and why it matters. Additionally, I would like you to note at least one realistic fallback cause or alternative hypothesis in case the primary diagnosis turns out to be incorrect or incomplete. It would also be really helpful if you could list all of the relevant configuration settings that matter for this particular issue, including their current values and why they are important. Finally, please include a set of short, actionable next steps that the on-call team can follow to resolve or further investigate the issue. Please make sure to format your response clearly and ensure that nothing important is left out of your analysis.",
      concise:
        "Diagnose the incident. Give the likely cause, one fallback cause, key settings, and short next steps.",
    },
    contexts: {
      naive: [
        "cat bench/fixtures/logs/server.log",
        "cat bench/fixtures/docs/runbook.md",
        "cat bench/fixtures/src/auth-service.ts",
      ],
      focused: [
        "wc -l bench/fixtures/logs/server.log",
        "grep -Ein \"level=ERROR|level=WARN|timeout|retry|session token|upstream saturation\" bench/fixtures/logs/server.log | tail -20",
        "grep -En \"30000ms|3 attempts|45 seconds|signer|cache|session token\" bench/fixtures/docs/runbook.md | head -20",
        "grep -En \"loginTimeoutMs|refreshTimeoutMs|strategy:|'exp-backoff'|attempts:|delaysMs|openCircuitSeconds|sessionCacheTimeoutMs|signerTimeoutMs\" bench/fixtures/src/auth-service.ts",
      ],
      budget: [
        "grep -Ein \"level=ERROR|level=WARN|timeout|retry|session token|upstream saturation\" bench/fixtures/logs/server.log | tail -10",
        "grep -En \"30000ms|3 attempts|45 seconds|signer|cache\" bench/fixtures/docs/runbook.md | head -8",
      ],
    },
    facts: [
      { id: "cause", patterns: [/upstream saturation/i], match: "any" },
      { id: "timeout", patterns: [/30000ms/i, /30000/i], match: "any" },
      { id: "retry", patterns: [/3 attempts/i, /attempts[^0-9]*3/i, /exp-backoff/i], match: "any" },
      { id: "circuit", patterns: [/45 seconds/i, /45s/i, /45/i], match: "any" },
      { id: "fallback", patterns: [/signer/i, /cache/i], match: "any" },
    ],
    passThreshold: 80,
  },
  {
    id: "config-audit",
    title: "Config Audit",
    responseShape:
      'Return strict JSON only: {"login_timeout_ms":null,"refresh_timeout_ms":null,"session_cache_timeout_ms":null,"signer_timeout_ms":null,"retry_strategy":"","retry_attempts":null,"retry_delays_ms":[],"open_circuit_seconds":null}',
    prompts: {
      verbose:
        "I need you to extract every single auth-related timeout and retry setting from the supplied context. Please go through the configuration carefully and return every relevant value you can find. For each setting, I want you to include the login timeout, the refresh timeout, the session cache timeout, the signer timeout, the retry strategy name, the number of retry attempts, the complete delay schedule with all values, and the circuit breaker timing. Please make sure you do not miss any of these values and that you return them exactly as they appear in the configuration without rounding or approximating.",
      concise:
        "Extract the exact auth timeout and retry settings. Return only the values.",
    },
    contexts: {
      naive: [
        "cat bench/fixtures/src/auth-service.ts",
        "cat bench/fixtures/docs/runbook.md",
      ],
      focused: [
        "grep -En \"loginTimeoutMs|refreshTimeoutMs|sessionCacheTimeoutMs|signerTimeoutMs|strategy:|'exp-backoff'|attempts:|delaysMs|openCircuitSeconds\" bench/fixtures/src/auth-service.ts",
      ],
      budget: [
        "grep -En \"loginTimeoutMs|refreshTimeoutMs|sessionCacheTimeoutMs|signerTimeoutMs|attempts:|openCircuitSeconds\" bench/fixtures/src/auth-service.ts",
      ],
    },
    facts: [
      { id: "login", patterns: [/30000/i], match: "any" },
      { id: "refresh", patterns: [/15000/i], match: "any" },
      { id: "cache", patterns: [/2500/i], match: "any" },
      { id: "signer", patterns: [/5000/i], match: "any" },
      { id: "strategy", patterns: [/exp-backoff/i], match: "any" },
      { id: "attempts", patterns: [/attempts[^0-9]*3/i, /3/i], match: "any" },
      { id: "delays", patterns: [/250/i, /1000/i, /4000/i], match: "all" },
      { id: "circuit", patterns: [/45/i], match: "any" },
    ],
    passThreshold: 100,
  },
];

const experiments = [
  {
    id: "verbose-focused",
    label: "Verbose + Focused Context",
    promptStyle: "verbose",
    contextStyle: "focused",
  },
  {
    id: "concise-focused",
    label: "Concise + Focused Context",
    promptStyle: "concise",
    contextStyle: "focused",
  },
  {
    id: "concise-budget",
    label: "Concise + Budget Context",
    promptStyle: "concise",
    contextStyle: "budget",
  },
  {
    id: "concise-focused-token-eff",
    label: "Concise + Focused + token-efficiency",
    promptStyle: "concise",
    contextStyle: "focused",
    skillIds: ["tokenEfficiency"],
  },
  {
    id: "concise-focused-text-opt",
    label: "Concise + Focused + text-optimizer",
    promptStyle: "concise",
    contextStyle: "focused",
    skillIds: ["textOptimizer"],
  },
  {
    id: "concise-focused-both-skills",
    label: "Concise + Focused + both skills",
    promptStyle: "concise",
    contextStyle: "focused",
    skillIds: ["tokenEfficiency", "textOptimizer"],
  },
  {
    id: "concise-focused-token-eff-micro",
    label: "Concise + Focused + token-efficiency micro",
    promptStyle: "concise",
    contextStyle: "focused",
    skillIds: ["tokenEfficiencyMicro"],
  },
  {
    id: "concise-focused-text-opt-micro",
    label: "Concise + Focused + text-optimizer micro",
    promptStyle: "concise",
    contextStyle: "focused",
    skillIds: ["textOptimizerMicro"],
  },
  {
    id: "concise-focused-both-micro",
    label: "Concise + Focused + both micro skills",
    promptStyle: "concise",
    contextStyle: "focused",
    skillIds: ["tokenEfficiencyMicro", "textOptimizerMicro"],
  },
  {
    id: "concise-focused-caveman",
    label: "Concise + Focused + caveman",
    promptStyle: "concise",
    contextStyle: "focused",
    skillIds: ["caveman"],
  },
  {
    id: "concise-focused-caveman-micro",
    label: "Concise + Focused + caveman micro",
    promptStyle: "concise",
    contextStyle: "focused",
    skillIds: ["cavemanMicro"],
  },
];

function buildContext(task, contextStyle) {
  const commands = task.contexts[contextStyle];
  const sections = commands.map((command) => {
    const output = runShell(command).trim();
    return [`$ ${command}`, output].filter(Boolean).join("\n");
  });

  return {
    commands,
    text: sections.join("\n\n"),
  };
}

function buildPrompt(task, experiment, contextText) {
  const injectedSkills = (experiment.skillIds || []).map((skillId) => skills[skillId]);
  const skillBlock =
    injectedSkills.length === 0
      ? null
      : [
          "<skills>",
          ...injectedSkills.map((skill) => `## ${skill.label}\n\n${skill.content}`),
          "</skills>",
        ].join("\n\n");

  return [
    "Use only the supplied context.",
    "Do not run shell commands.",
    "Do not inspect files.",
    "Do not browse the web.",
    "Do not guess missing values; use null or an empty string if the context does not support a field.",
    skillBlock,
    task.prompts[experiment.promptStyle],
    task.responseShape,
    "<context>",
    contextText,
    "</context>",
  ].join("\n\n");
}

function stripFences(text) {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "").trim();
}

function scoreAnswer(task, answer) {
  const normalized = stripFences(answer);
  const found = task.facts.filter((fact) => {
    const mode = fact.match || "all";
    return mode === "any"
      ? fact.patterns.some((pattern) => pattern.test(normalized))
      : fact.patterns.every((pattern) => pattern.test(normalized));
  });
  const missing = task.facts.filter((fact) => !found.includes(fact));
  const qualityScore = round((found.length / task.facts.length) * 100, 1);

  return {
    qualityScore,
    passed: qualityScore >= task.passThreshold,
    foundFacts: found.map((fact) => fact.id),
    missingFacts: missing.map((fact) => fact.id),
  };
}

function runClaude(prompt, _runKey) {
  const MAX_BUDGET = process.env.BENCH_MAX_USD || "0.50";
  const args = [
    "-p",
    "--output-format", "json",
    "--model", MODEL,
    "--no-session-persistence",
    "--disable-slash-commands",
    "--tools", "",
    "--max-budget-usd", MAX_BUDGET,
    prompt,
  ];

  const startedAt = Date.now();
  const result = spawnSync("claude", args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: Number(process.env.BENCH_TIMEOUT || 180000),
  });
  const durationMs = Date.now() - startedAt;
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";

  let parsed = {};
  try {
    parsed = JSON.parse(stdout.trim());
  } catch {
    // stdout may not be valid JSON on error
  }

  const answer = parsed.result || "";
  const isError = parsed.is_error === true || result.status !== 0;
  const usage = parsed.usage || {};
  const modelUsage = parsed.modelUsage || {};
  const modelKey = Object.keys(modelUsage)[0];
  const modelStats = modelKey ? modelUsage[modelKey] : {};

  const inputTokens = modelStats.inputTokens ?? usage.input_tokens ?? 0;
  const cacheReadTokens = modelStats.cacheReadInputTokens ?? usage.cache_read_input_tokens ?? 0;
  const cacheCreationTokens = modelStats.cacheCreationInputTokens ?? usage.cache_creation_input_tokens ?? 0;
  const cachedInputTokens = cacheReadTokens + cacheCreationTokens;
  const outputTokens = modelStats.outputTokens ?? usage.output_tokens ?? 0;

  return {
    ok: !isError,
    exitCode: result.status ?? 1,
    durationMs,
    answer,
    stdout,
    stderr,
    usage: {
      input_tokens: inputTokens,
      cached_input_tokens: cachedInputTokens,
      cache_read_input_tokens: cacheReadTokens,
      cache_creation_input_tokens: cacheCreationTokens,
      output_tokens: outputTokens,
    },
    completedItemTypes: [],
    usedNonMessageItems: [],
    costUsd: modelStats.costUSD ?? parsed.total_cost_usd ?? 0,
    error: isError
      ? (parsed.errors?.join("; ") || stderr || `claude exited with status ${String(result.status ?? 1)}`).trim()
      : null,
  };
}

const taskFilterSet = TASK_FILTER ? new Set(TASK_FILTER.split(",").map((value) => value.trim())) : null;
const experimentFilterSet = EXPERIMENT_FILTER
  ? new Set(EXPERIMENT_FILTER.split(",").map((value) => value.trim()))
  : null;

const filteredTasks = taskFilterSet ? tasks.filter((task) => taskFilterSet.has(task.id)) : tasks;
const filteredExperiments = experimentFilterSet
  ? experiments.filter((experiment) => experimentFilterSet.has(experiment.id))
  : experiments;

if (filteredTasks.length === 0) {
  console.error(`No task matched BENCH_TASK=${TASK_FILTER}`);
  process.exit(1);
}

if (filteredExperiments.length === 0) {
  console.error(`No experiment matched BENCH_EXPERIMENT=${EXPERIMENT_FILTER}`);
  process.exit(1);
}

const totalRuns = filteredTasks.length * filteredExperiments.length * REPS;

console.log("Live Codex Benchmark");
console.log("");
console.log(`Model: ${MODEL}`);
console.log(`Tasks: ${filteredTasks.map((task) => task.id).join(", ")}`);
console.log(`Experiments: ${filteredExperiments.map((experiment) => experiment.id).join(", ")}`);
console.log(`Reps: ${REPS}`);
console.log(`Total runs: ${totalRuns}`);
console.log(`Results dir: ${RESULTS_DIR}`);
console.log("");

if (DRY_RUN) {
  console.log("Dry run only.");
  process.exit(0);
}

ensureFixtures();

const isTTY = process.stdout.isTTY;
const BAR_WIDTH = 30;
const startTime = Date.now();

function progressBar(current, total, label) {
  const pct = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * BAR_WIDTH);
  const bar = "█".repeat(filled) + "░".repeat(BAR_WIDTH - filled);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  const avgPerRun = current > 0 ? (Date.now() - startTime) / current : 0;
  const eta = current > 0 ? Math.round(((total - current) * avgPerRun) / 1000) : "?";
  const line = `  ${bar} ${pct}% (${current}/${total}) ${elapsed}s elapsed, ~${eta}s left · ${label}`;
  if (isTTY) {
    process.stdout.write(`\r\x1b[K${line}`);
  } else {
    console.log(line);
  }
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const rows = [];

for (const task of filteredTasks) {
  for (const experiment of filteredExperiments) {
    for (let rep = 1; rep <= REPS; rep += 1) {
      const runKey = `${timestamp}-${task.id}-${experiment.id}-${rep}`;
      const context = buildContext(task, experiment.contextStyle);
      const prompt = buildPrompt(task, experiment, context.text);
      const skillTokensLocal = countTokens(
        ((experiment.skillIds || []).map((skillId) => skills[skillId].content).join("\n\n"))
      );
      const promptTokensLocal = countTokens(prompt);
      const contextTokensLocal = countTokens(context.text);

      const label = `${task.id} · ${experiment.id} · rep ${rep}`;
      progressBar(rows.length, totalRuns, label);

      const live = runClaude(prompt, runKey);
      const score = scoreAnswer(task, live.answer);
      const inputTokens = live.usage.input_tokens ?? 0;
      const cachedInputTokens = live.usage.cached_input_tokens ?? 0;
      const outputTokens = live.usage.output_tokens ?? 0;
      const uncachedInputTokens = Math.max(inputTokens - cachedInputTokens, 0);

      rows.push({
        run_id: runKey,
        task_id: task.id,
        task_title: task.title,
        experiment_id: experiment.id,
        experiment_label: experiment.label,
        prompt_style: experiment.promptStyle,
        context_style: experiment.contextStyle,
        injected_skills: experiment.skillIds || [],
        rep,
        prompt_tokens_local: promptTokensLocal,
        context_tokens_local: contextTokensLocal,
        skill_tokens_local: skillTokensLocal,
        input_tokens: inputTokens,
        cached_input_tokens: cachedInputTokens,
        uncached_input_tokens: uncachedInputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        uncached_total_tokens: uncachedInputTokens + outputTokens,
        quality_score: score.qualityScore,
        passed: score.passed && live.ok,
        codex_ok: live.ok,
        exit_code: live.exitCode,
        duration_ms: live.durationMs,
        used_non_message_items: live.usedNonMessageItems.length,
        non_message_item_types: live.usedNonMessageItems,
        found_facts: score.foundFacts,
        missing_facts: score.missingFacts,
        commands: context.commands,
        answer: live.answer.trim(),
        cost_usd: live.costUsd ?? 0,
        error: live.error,
      });
    }
  }
}

progressBar(totalRuns, totalRuns, "done");
if (isTTY) process.stdout.write("\n");

const summaryByExperiment = filteredExperiments.map((experiment) => {
  const experimentRows = rows.filter((row) => row.experiment_id === experiment.id);

  return {
    experiment_id: experiment.id,
    experiment_label: experiment.label,
    runs: experimentRows.length,
    pass_rate: round(
      (experimentRows.filter((row) => row.passed).length / Math.max(experimentRows.length, 1)) * 100,
      1
    ),
    avg_input_tokens: round(avg(experimentRows.map((row) => row.input_tokens)), 1),
    avg_cached_input_tokens: round(avg(experimentRows.map((row) => row.cached_input_tokens)), 1),
    avg_uncached_input_tokens: round(avg(experimentRows.map((row) => row.uncached_input_tokens)), 1),
    avg_output_tokens: round(avg(experimentRows.map((row) => row.output_tokens)), 1),
    avg_total_tokens: round(avg(experimentRows.map((row) => row.total_tokens)), 1),
    avg_uncached_total_tokens: round(avg(experimentRows.map((row) => row.uncached_total_tokens)), 1),
    avg_quality_score: round(avg(experimentRows.map((row) => row.quality_score)), 1),
    avg_duration_ms: round(avg(experimentRows.map((row) => row.duration_ms)), 1),
    avg_skill_tokens_local: round(avg(experimentRows.map((row) => row.skill_tokens_local)), 1),
  };
});

const verboseFocused = summaryByExperiment.find((item) => item.experiment_id === "verbose-focused");
const conciseFocused = summaryByExperiment.find((item) => item.experiment_id === "concise-focused");
const conciseBudget = summaryByExperiment.find((item) => item.experiment_id === "concise-budget");
const conciseFocusedTokenEff = summaryByExperiment.find(
  (item) => item.experiment_id === "concise-focused-token-eff"
);
const conciseFocusedTextOpt = summaryByExperiment.find(
  (item) => item.experiment_id === "concise-focused-text-opt"
);
const conciseFocusedBothSkills = summaryByExperiment.find(
  (item) => item.experiment_id === "concise-focused-both-skills"
);
const conciseFocusedTokenEffMicro = summaryByExperiment.find(
  (item) => item.experiment_id === "concise-focused-token-eff-micro"
);
const conciseFocusedTextOptMicro = summaryByExperiment.find(
  (item) => item.experiment_id === "concise-focused-text-opt-micro"
);
const conciseFocusedBothMicro = summaryByExperiment.find(
  (item) => item.experiment_id === "concise-focused-both-micro"
);
const conciseFocusedCaveman = summaryByExperiment.find(
  (item) => item.experiment_id === "concise-focused-caveman"
);
const conciseFocusedCavemanMicro = summaryByExperiment.find(
  (item) => item.experiment_id === "concise-focused-caveman-micro"
);

function makeDelta(from, to) {
  if (!from || !to) return null;
  return {
    from: from.experiment_id,
    to: to.experiment_id,
    delta_total_tokens: round(to.avg_total_tokens - from.avg_total_tokens, 1),
    delta_uncached_total_tokens: round(to.avg_uncached_total_tokens - from.avg_uncached_total_tokens, 1),
    delta_output_tokens: round(to.avg_output_tokens - from.avg_output_tokens, 1),
    quality_delta: round(to.avg_quality_score - from.avg_quality_score, 1),
  };
}

const comparisons = {
  // text-optimizer: verbose prompt -> concise prompt (same focused context)
  prompt_compression: makeDelta(verboseFocused, conciseFocused),
  // additional: focused context -> budget context
  context_compression: makeDelta(conciseFocused, conciseBudget),
  skill_injection: [
    conciseFocusedTokenEff,
    conciseFocusedTextOpt,
    conciseFocusedBothSkills,
    conciseFocusedTokenEffMicro,
    conciseFocusedTextOptMicro,
    conciseFocusedBothMicro,
    conciseFocusedCaveman,
    conciseFocusedCavemanMicro,
  ]
    .filter(Boolean)
    .map((target) => ({
      from: "concise-focused",
      to: target.experiment_id,
      delta_total_tokens: round(target.avg_total_tokens - conciseFocused.avg_total_tokens, 1),
      delta_uncached_total_tokens: round(
        target.avg_uncached_total_tokens - conciseFocused.avg_uncached_total_tokens,
        1
      ),
      delta_output_tokens: round(target.avg_output_tokens - conciseFocused.avg_output_tokens, 1),
      quality_delta: round(target.avg_quality_score - conciseFocused.avg_quality_score, 1),
      avg_skill_tokens_local: target.avg_skill_tokens_local,
    })),
};

function toCsv(rowsToWrite) {
  const columns = [
    "run_id",
    "task_id",
    "experiment_id",
    "rep",
    "input_tokens",
    "cached_input_tokens",
    "uncached_input_tokens",
    "output_tokens",
    "total_tokens",
    "uncached_total_tokens",
    "quality_score",
    "passed",
    "duration_ms",
    "used_non_message_items",
  ];

  const lines = [columns.join(",")];

  for (const row of rowsToWrite) {
    lines.push(columns.map((column) => JSON.stringify(row[column] ?? "")).join(","));
  }

  return `${lines.join("\n")}\n`;
}

function buildMarkdown() {
  const lines = [];

  lines.push("# Live Codex Benchmark");
  lines.push("");
  lines.push(`Model: \`${MODEL}\``);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Experiment | Pass Rate | Avg Quality | Avg Input | Avg Cached | Avg Uncached Total | Avg Output | Avg Duration |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");

  for (const item of summaryByExperiment) {
    lines.push(
      `| ${item.experiment_label} | ${item.pass_rate}% | ${item.avg_quality_score} | ${item.avg_input_tokens} | ${item.avg_cached_input_tokens} | ${item.avg_uncached_total_tokens} | ${item.avg_output_tokens} | ${item.avg_duration_ms} ms |`
    );
  }

  lines.push("");
  lines.push("## Per Run");
  lines.push("");
  lines.push("| Task | Experiment | Input | Cached | Uncached Total | Output | Quality | Pass |");
  lines.push("| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |");

  for (const row of rows) {
    lines.push(
      `| ${row.task_title} | ${row.experiment_label} | ${row.input_tokens} | ${row.cached_input_tokens} | ${row.uncached_total_tokens} | ${row.output_tokens} | ${row.quality_score} | ${
        row.passed ? "yes" : "no"
      } |`
    );
  }

  const mdComparisons = [
    ["Prompt: Verbose → Concise (text-optimizer)", comparisons.prompt_compression],
    ["Context: Focused → Budget", comparisons.context_compression],
  ];

  const hasAny = mdComparisons.some(([, c]) => c);
  if (hasAny) {
    lines.push("");
    lines.push("## Deltas");
    lines.push("");
    lines.push("| Comparison | Total Δ | Uncached Total Δ | Output Δ | Quality Δ |");
    lines.push("| --- | ---: | ---: | ---: | ---: |");
    for (const [label, c] of mdComparisons) {
      if (!c) continue;
      lines.push(`| ${label} | ${c.delta_total_tokens} | ${c.delta_uncached_total_tokens} | ${c.delta_output_tokens} | ${c.quality_delta} |`);
    }
  }

  if (comparisons.skill_injection?.length) {
    lines.push("");
    lines.push("## Skill Injection");
    lines.push("");
    lines.push("| Comparison | Local Skill Tokens | Total Δ | Uncached Total Δ | Output Δ | Quality Δ |");
    lines.push("| --- | ---: | ---: | ---: | ---: | ---: |");
    for (const comparison of comparisons.skill_injection) {
      lines.push(
        `| ${comparison.from} → ${comparison.to} | ${comparison.avg_skill_tokens_local} | ${comparison.delta_total_tokens} | ${comparison.delta_uncached_total_tokens} | ${comparison.delta_output_tokens} | ${comparison.quality_delta} |`
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

const output = {
  meta: {
    generated_at: new Date().toISOString(),
    model: MODEL,
    reps: REPS,
    tasks: filteredTasks.map((task) => task.id),
    experiments: filteredExperiments.map((experiment) => experiment.id),
    total_runs: rows.length,
  },
  summary_by_experiment: summaryByExperiment,
  comparisons,
  rows,
};

const jsonPath = join(RESULTS_DIR, `bench-${timestamp}.json`);
const csvPath = join(RESULTS_DIR, `bench-${timestamp}.csv`);
const mdPath = join(RESULTS_DIR, `bench-${timestamp}.md`);

writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
writeFileSync(csvPath, toCsv(rows), "utf8");
writeFileSync(mdPath, buildMarkdown(), "utf8");

console.log("");
console.log("Summary");

for (const item of summaryByExperiment) {
  console.log(
    `- ${item.experiment_label}: pass ${item.pass_rate}%, avg quality ${item.avg_quality_score}, avg input ${item.avg_input_tokens}, avg cached ${item.avg_cached_input_tokens}, avg uncached total ${item.avg_uncached_total_tokens}, avg output ${item.avg_output_tokens}`
  );
}

const comparisonLabels = {
  prompt_compression: ["text-optimizer style prompt compression", verboseFocused],
  context_compression: ["context budget (focused->budget)", conciseFocused],
};

for (const [key, [label, base]] of Object.entries(comparisonLabels)) {
  const c = comparisons[key];
  if (!c || !base) continue;
  console.log(
    `- ${label}: total ${c.delta_total_tokens} (${formatPercent(c.delta_total_tokens, base.avg_total_tokens)}), uncached ${c.delta_uncached_total_tokens} (${formatPercent(c.delta_uncached_total_tokens, base.avg_uncached_total_tokens)}), quality ${c.quality_delta}`
  );
}

for (const comparison of comparisons.skill_injection || []) {
  console.log(
    `- Skill injection ${comparison.to}: local skill prompt ${comparison.avg_skill_tokens_local}, total ${comparison.delta_total_tokens} (${formatPercent(
      comparison.delta_total_tokens,
      conciseFocused.avg_total_tokens
    )}), uncached ${comparison.delta_uncached_total_tokens} (${formatPercent(
      comparison.delta_uncached_total_tokens,
      conciseFocused.avg_uncached_total_tokens
    )}), quality ${comparison.quality_delta}`
  );
}

console.log("");
console.log(`JSON: ${jsonPath}`);
console.log(`CSV: ${csvPath}`);
console.log(`Markdown: ${mdPath}`);
