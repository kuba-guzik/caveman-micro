# Incident Runbook

This runbook describes how the team should inspect authentication incidents, reduce noisy investigation steps, and confirm the exact retry and timeout settings before changing production behavior.

## Authentication Overview

- Login requests enter through `auth-api` and then fan out to the session service, token signer, and cache layer.
- Session refresh should normally finish in under 800ms.
- A timeout at 30000ms usually points to upstream saturation, blocked retries, or a stuck signer dependency.

## Retry Policy

- Default retry policy: exponential backoff with 3 attempts.
- Backoff schedule: 250ms, 1000ms, 4000ms.
- Open the circuit for 45 seconds when the retry budget is exhausted.
- Never increase retries before confirming whether the timeout is caused by the signer or the cache.

## Timeout Settings

- Login request timeout: 30000ms.
- Token refresh timeout: 15000ms.
- Session cache timeout: 2500ms.
- Signer timeout: 5000ms.

## Triage Checklist

- Find the latest `ERROR` and `WARN` lines that mention `login`, `timeout`, `retry`, or `session token`.
- Compare the most recent failure timestamp with deploy timestamps.
- Check whether the circuit opened before or after the timeout spike.
- Confirm whether the same user or shard repeats across failures.

## Notes

- Note 1: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 2: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 3: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 4: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 5: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 6: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 7: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 8: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 9: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 10: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 11: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 12: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 13: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 14: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 15: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 16: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 17: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 18: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 19: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 20: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 21: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 22: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 23: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 24: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 25: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 26: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 27: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 28: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 29: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 30: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 31: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 32: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 33: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 34: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 35: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 36: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 37: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 38: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 39: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 40: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 41: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 42: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 43: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 44: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 45: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 46: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 47: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 48: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 49: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 50: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 51: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 52: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 53: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 54: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 55: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 56: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 57: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 58: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 59: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 60: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 61: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 62: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 63: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 64: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 65: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 66: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 67: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 68: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 69: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 70: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 71: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 72: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 73: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 74: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 75: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 76: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 77: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 78: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 79: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 80: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 81: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 82: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 83: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 84: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 85: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 86: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 87: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 88: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 89: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 90: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 91: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 92: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 93: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 94: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 95: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 96: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 97: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 98: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 99: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 100: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 101: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 102: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 103: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 104: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 105: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 106: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 107: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 108: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 109: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 110: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 111: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 112: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 113: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 114: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 115: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 116: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 117: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 118: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 119: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
- Note 120: review login timeout incidents with request correlation, confirm retry budget, verify token signer health, and avoid reading the full log when targeted search is enough.
