# BASIRA test plan and results

## Automated validation

The repository currently passes:

- `pnpm check` — TypeScript diagnostics pass.
- `pnpm test` — **3 test files, 11 tests passed**.
- `pnpm build:static` — production Vite build succeeds and includes `manus-routes.json`.
- HTTP smoke check — `/` returns `200`, and `/manus-routes.json` returns `200` with valid JSON.

## Covered cases

| Case | Expected behavior | Current result |
| --- | --- | --- |
| Benign URL: `https://example.com/about` | Low risk, effective domain parsed, no external fetch | Passed |
| Suspicious URL with `.xyz`, hyphens and `/verify` | High risk with structural indicators | Passed |
| Brand impersonation | `brand-impersonation` inference is visible | Passed |
| Scam-like message with urgency, card-details request and link | Urgency, sensitive request and message-link signals | Passed |
| Benign message | No strong local rule hit; low score | Passed |
| Password / OTP text | Warning predicate detects it before analysis | Passed |
| False-positive / false-negative behavior | Result stays qualified; no accuracy claim | Guarded by product language, not statistically validated |

## Manual demo checks

Before a judging session, verify that the demo starts with the synthetic URL, **Analyze safely** updates the score, each of the four tabs opens, the Arabic toggle changes direction and labels, and the **Load demo case** action restores the case. Verify that a string containing “password” or “OTP” disables analysis and shows the warning.

## Known gaps

This MVP does not establish real-world precision/recall. It has no labeled corpus, reputation feed, HTML rendering, screenshot analysis, DNS lookup, or official data integration. Those are intentionally excluded from the demo scope. A future evaluation should create a held-out, licensed or synthetic dataset with benign links, phishing links, brand impersonation, multi-stage messages, false positives, and false negatives, then report precision, recall, calibration, and failure examples separately for URLs and messages.
