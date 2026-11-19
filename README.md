# BASIRA — Scam Journey Intelligence

> **Don’t Just Detect the Scam. Understand the Attack.**

BASIRA (بصيرة) is a defensive cybersecurity web prototype for reviewing suspicious URLs and messages. Its differentiator is the **Scam Journey Reconstruction Engine**: instead of returning an unexplained label, the app connects local signals to evidence, separates Evidence from Inference and Hypothesis, and presents a reviewable timeline with practical next actions.

## What works in this MVP

The browser UI accepts a URL or message, auto-detects the input type, and runs a deterministic local analysis. It never opens, fetches, renders, or downloads from the submitted destination. The analyzer looks for explainable signals such as brand look-alikes, suspicious domain endings, direct IP hosts, unusual hostname structure, account-action paths, urgency, embedded links, and requests for sensitive information.

The result includes a risk score, a cautious verdict, an Evidence Explorer, linked artifacts, a visual journey timeline, confidence/uncertainty labels, and protective recommendations. The demo starts with synthetic Emirates NBD impersonation evidence and can be reset with **Load demo case**. The interface supports English and Arabic labels with RTL switching.

## Run locally

```bash
pnpm install
pnpm dev:static
```

The static preview listens on port `3000` unless `PORT` is provided. For validation:

```bash
pnpm check
pnpm test
pnpm build:static
```

## Architecture

The MVP is intentionally static and local-first:

- `client/src/pages/Home.tsx` contains the analyst workspace and presentation state.
- `client/src/lib/analyzer.ts` contains the pure local analysis engine and the synthetic demo fixture.
- `client/src/lib/analyzer.test.ts` covers benign, suspicious, impersonation, message, and secret-warning cases.
- `client/src/index.css` defines the responsive BASIRA visual system.
- `client/public/manus-routes.json` declares the served page routes.
- `docs/architecture.mmd` is the architecture diagram source.

There is no database, login, reputation API, browser automation, or external URL fetch in this build. That is a deliberate scope decision for a reliable hackathon demo and a safer default.

## Safety boundary

BASIRA is a triage aid, not a verdict engine. A low score does not certify that a destination is safe, and a hypothesis in the journey is not a confirmed event. Users must not paste passwords, OTPs, card numbers, or other secrets. The prototype makes no claim of official integration with Abu Dhabi Police, banks, browsers, or threat-intelligence providers.

## Demo and validation

The short demo flow is documented in [`docs/demo-script.md`](docs/demo-script.md). The current test plan and honest results are in [`docs/test-plan.md`](docs/test-plan.md). The public challenge description discovered during preparation emphasizes a working or clickable prototype, a short demo, clear problem/solution explanation, build notes, impact, design/accessibility, and safety; see the [public ScamShield challenge page](https://techelevate-scamshield.devpost.com/) and the [published ScamShield AI project description](https://devpost.com/software/scamshield-ai-m4fhbk). The specific 42 Abu Dhabi / Abu Dhabi Police event details in the supplied brief were not confirmed on an official public page during this pass and should be rechecked with the organizers before submission.

## Next build, if time remains

The next safe increment is a versioned evidence store for synthetic cases plus an optional, isolated reputation connector that is clearly labeled as external data. It should be added only with an explicit privacy model, rate limits, source attribution, and evaluation on a held-out dataset. Browser rendering and automated page inspection should stay sandboxed and opt-in; they should not be added as a hidden fetch behind the current analysis button.
