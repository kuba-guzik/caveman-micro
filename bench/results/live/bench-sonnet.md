# Live Codex Benchmark

Model: `sonnet`

## Summary

| Experiment | Pass Rate | Avg Quality | Avg Input | Avg Cached | Avg Uncached Total | Avg Output | Avg Duration |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Concise + Focused Context | 100% | 100 | 3 | 32819.2 | 258.7 | 258.7 | 13129.8 ms |
| Concise + Focused + caveman | 100% | 100 | 3 | 33444.2 | 225 | 225 | 12449.3 ms |
| Concise + Focused + caveman micro | 100% | 100 | 3 | 29744 | 222.7 | 222.7 | 12559.2 ms |

## Per Run

| Task | Experiment | Input | Cached | Uncached Total | Output | Quality | Pass |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Incident Diagnosis | Concise + Focused Context | 3 | 34093 | 446 | 446 | 100 | yes |
| Incident Diagnosis | Concise + Focused Context | 3 | 34093 | 438 | 438 | 100 | yes |
| Incident Diagnosis | Concise + Focused Context | 3 | 34093 | 407 | 407 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman | 3 | 34718 | 394 | 394 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman | 3 | 34718 | 351 | 351 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman | 3 | 34718 | 344 | 344 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman micro | 3 | 23881 | 343 | 343 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman micro | 3 | 24162 | 339 | 339 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman micro | 3 | 34202 | 393 | 393 | 100 | yes |
| Config Audit | Concise + Focused Context | 3 | 31964 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused Context | 3 | 30708 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused Context | 3 | 31964 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman | 3 | 31333 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman | 3 | 32589 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman | 3 | 32589 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman micro | 3 | 32073 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman micro | 3 | 32073 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman micro | 3 | 32073 | 87 | 87 | 100 | yes |

## Skill Injection

| Comparison | Local Skill Tokens | Total Δ | Uncached Total Δ | Output Δ | Quality Δ |
| --- | ---: | ---: | ---: | ---: | ---: |
| concise-focused → concise-focused-caveman | 552 | -33.7 | -33.7 | -33.7 | 0 |
| concise-focused → concise-focused-caveman-micro | 85 | -36 | -36 | -36 | 0 |
