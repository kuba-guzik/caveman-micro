# caveman-micro

<img width="1456" height="816" alt="jakguzik_Split_screen_infographic_style_illustration _Left_si_a0d87b94-f6d0-4aef-80ad-1e6ec4ae2cd6_1" src="https://github.com/user-attachments/assets/d8540991-cc97-400f-a92b-0c2bbd86745d" />


**6 lines. 85 tokens. Outperformed the 552-token original.**

We benchmarked the viral [caveman](https://github.com/JuliusBrussee/caveman) token-saving prompt on real coding tasks. Then we distilled it into 6 lines that beat the original on both Claude Sonnet and Opus.

## The micro prompt

```
Respond like smart caveman. Cut all filler, keep technical substance.
- Drop articles (a, an, the), filler (just, really, basically, actually).
- Drop pleasantries (sure, certainly, happy to).
- No hedging. Fragments fine. Short synonyms.
- Technical terms stay exact. Code blocks unchanged.
- Pattern: [thing] [action] [reason]. [next step].
```

Copy it into your system prompt, custom instructions (ChatGPT), or CLAUDE.md. Works with any LLM.

## Benchmark results

Tested on real tasks (incident diagnosis, config extraction) with structured JSON output and quality verification.

### Claude Sonnet

| Group | Avg Output Tokens | Quality | Savings |
|---|---:|---:|---:|
| Baseline ("Be concise") | 259 | 100% | -- |
| Caveman full (552 tok) | 225 | 100% | 13% |
| **Caveman Micro (85 tok)** | **223** | **100%** | **14%** |

### Claude Opus

| Group | Avg Output Tokens | Quality | Savings |
|---|---:|---:|---:|
| Baseline ("Be concise") | 227 | 100% | -- |
| Caveman full (552 tok) | 207 | 100% | 9% |
| **Caveman Micro (85 tok)** | **180** | **100%** | **21%** |

Quality: 100% in every run. Zero missing facts. The micro version outperformed the full skill on both models.

## Why micro beats full

The model already knows how to be concise. It doesn't need a 552-token tutorial. It needs 6 lines of permission.

A longer instruction set costs tokens to inject and gives the model more noise to process. The short nudge does the same job at one-sixth the injection cost.

## When to expect what savings

| How you use AI | Expected savings |
|---|---|
| Open-ended chat, explanations, brainstorming | 40-65% |
| Structured work (code, JSON, data extraction) | 14-21% |
| API calls at scale | 14-21% (compounds across millions of calls) |

The bigger your baseline prompt already optimizes for conciseness, the smaller the additional gain. But since quality stays at 100%, the cost of trying is zero.

## The real insight

The biggest token savings come from your base prompt, not from output compression.

"Be concise. Return JSON." does more than any skill layered on top. Caveman micro is the last 14-21% on a foundation that already handles 60%.

## Use it

**Any LLM** -- paste the 6 lines into your system prompt or custom instructions.

**Claude Code** -- add to your `CLAUDE.md`:
```
# Token efficiency
Respond like smart caveman. Cut all filler, keep technical substance.
- Drop articles (a, an, the), filler (just, really, basically, actually).
- Drop pleasantries (sure, certainly, happy to).
- No hedging. Fragments fine. Short synonyms.
- Technical terms stay exact. Code blocks unchanged.
- Pattern: [thing] [action] [reason]. [next step].
```

**ChatGPT** -- Settings > Personalization > Custom Instructions > paste the 6 lines.

**Cursor / Windsurf** -- add to your project rules file.

## Run the benchmark yourself

```bash
git clone https://github.com/kuba-guzik/caveman-micro.git
cd caveman-micro
npm install
npm run bench:live:dry   # preview the plan
npm run bench:live       # run (requires Claude Code CLI)
npm run bench:analyze    # analyze results
```

### Configuration

| Variable | Default | Description |
|---|---|---|
| `BENCH_MODEL` | `sonnet` | Model alias (sonnet, opus, haiku) |
| `BENCH_REPS` | `3` | Repetitions per task x group |
| `BENCH_EXPERIMENT` | all | Filter experiments (comma-separated) |
| `BENCH_TASK` | all | Filter tasks (comma-separated) |
| `BENCH_DRY` | `0` | Set `1` to print plan without running |

## Raw data

Full benchmark results (JSON, CSV, Markdown) are in [`bench/results/live/`](bench/results/live/).

- [Sonnet results](bench/results/live/bench-sonnet.md)
- [Opus results](bench/results/live/bench-opus.md)

## Article

Full writeup with methodology and analysis: *link coming soon*

## Credits

- Original caveman skill: [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)
- Benchmark methodology inspired by [Brevity Constraints Reverse Performance Hierarchies in Language Models](https://arxiv.org/abs/2604.00025) (March 2026)

## License

MIT
