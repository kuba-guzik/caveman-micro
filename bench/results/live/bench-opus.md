# Live Codex Benchmark

Model: `opus`

## Summary

| Experiment | Pass Rate | Avg Quality | Avg Input | Avg Cached | Avg Uncached Total | Avg Output | Avg Duration |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Concise + Focused Context | 100% | 100 | 3 | 33131.5 | 226.8 | 226.8 | 13575.7 ms |
| Concise + Focused + caveman | 100% | 100 | 3 | 33756.5 | 206.7 | 206.7 | 14686.3 ms |
| Concise + Focused + caveman micro | 100% | 100 | 3 | 33030.5 | 180 | 180 | 14295 ms |

## Per Run

| Task | Experiment | Input | Cached | Uncached Total | Output | Quality | Pass |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Incident Diagnosis | Concise + Focused Context | 3 | 34196 | 371 | 371 | 100 | yes |
| Incident Diagnosis | Concise + Focused Context | 3 | 34196 | 403 | 403 | 100 | yes |
| Incident Diagnosis | Concise + Focused Context | 3 | 34196 | 326 | 326 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman | 3 | 34821 | 284 | 284 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman | 3 | 34821 | 335 | 335 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman | 3 | 34821 | 360 | 360 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman micro | 3 | 34305 | 304 | 304 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman micro | 3 | 34305 | 255 | 255 | 100 | yes |
| Incident Diagnosis | Concise + Focused + caveman micro | 3 | 34305 | 257 | 257 | 100 | yes |
| Config Audit | Concise + Focused Context | 3 | 32067 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused Context | 3 | 32067 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused Context | 3 | 32067 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman | 3 | 32692 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman | 3 | 32692 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman | 3 | 32692 | 87 | 87 | 100 | yes |
| Config Audit | Concise + Focused + caveman micro | 3 | 32176 | 88 | 88 | 100 | yes |
| Config Audit | Concise + Focused + caveman micro | 3 | 32176 | 88 | 88 | 100 | yes |
| Config Audit | Concise + Focused + caveman micro | 3 | 30916 | 88 | 88 | 100 | yes |

## Skill Injection

| Comparison | Local Skill Tokens | Total Δ | Uncached Total Δ | Output Δ | Quality Δ |
| --- | ---: | ---: | ---: | ---: | ---: |
| concise-focused → concise-focused-caveman | 552 | -20.1 | -20.1 | -20.1 | 0 |
| concise-focused → concise-focused-caveman-micro | 85 | -46.8 | -46.8 | -46.8 | 0 |
