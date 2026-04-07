#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const LIVE_DIR = join(ROOT, "bench", "results", "live");

function findLatest() {
  const files = readdirSync(LIVE_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("No live benchmark results found.");
    process.exit(1);
  }

  return join(LIVE_DIR, files[0]);
}

function avg(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const filePath = process.argv[2] || findLatest();
const data = JSON.parse(readFileSync(filePath, "utf8"));
const rows = data.rows || [];

console.log("Live Codex Benchmark Analysis");
console.log("");
console.log(`Source: ${filePath}`);
console.log(`Model: ${data.meta?.model || "unknown"}`);
console.log(`Runs: ${data.meta?.total_runs || rows.length}`);
console.log("");

const experiments = [...new Set(rows.map((row) => row.experiment_id))];
const tasks = [...new Set(rows.map((row) => row.task_id))];

console.log("By experiment");

for (const experimentId of experiments) {
  const group = rows.filter((row) => row.experiment_id === experimentId);
  console.log(
    `- ${experimentId}: pass ${avg(group.map((row) => (row.passed ? 100 : 0))).toFixed(1)}%, avg quality ${avg(
      group.map((row) => row.quality_score)
    ).toFixed(1)}, avg input ${avg(group.map((row) => row.input_tokens)).toFixed(1)}, avg cached ${avg(
      group.map((row) => row.cached_input_tokens)
    ).toFixed(1)}, avg uncached total ${avg(group.map((row) => row.uncached_total_tokens)).toFixed(
      1
    )}, avg output ${avg(group.map((row) => row.output_tokens)).toFixed(1)}, avg local skill ${avg(
      group.map((row) => row.skill_tokens_local || 0)
    ).toFixed(1)}`
  );
}

console.log("");
console.log("By task");

for (const taskId of tasks) {
  const taskRows = rows.filter((row) => row.task_id === taskId);
  console.log(`- ${taskId}`);

  for (const experimentId of experiments) {
    const subset = taskRows.filter((row) => row.experiment_id === experimentId);
    if (subset.length === 0) {
      continue;
    }

    console.log(
      `  ${experimentId}: quality ${avg(subset.map((row) => row.quality_score)).toFixed(
        1
      )}, uncached total ${avg(subset.map((row) => row.uncached_total_tokens)).toFixed(1)}, output ${avg(
        subset.map((row) => row.output_tokens)
      ).toFixed(1)}`
    );
  }
}

const compLabels = {
  prompt_compression: "text-optimizer style prompt compression",
  context_compression: "context budget (focused->budget)",
};

if (data.comparisons) {
  console.log("");
  console.log("Deltas");
  for (const [key, label] of Object.entries(compLabels)) {
    const c = data.comparisons[key];
    if (!c) continue;
    console.log(
      `- ${label}: ${c.from} -> ${c.to}, total ${c.delta_total_tokens}, uncached ${c.delta_uncached_total_tokens}, output ${c.delta_output_tokens}, quality ${c.quality_delta}`
    );
  }

  for (const c of data.comparisons.skill_injection || []) {
    console.log(
      `- skill injection: ${c.from} -> ${c.to}, local skill ${c.avg_skill_tokens_local}, total ${c.delta_total_tokens}, uncached ${c.delta_uncached_total_tokens}, output ${c.delta_output_tokens}, quality ${c.quality_delta}`
    );
  }
}
