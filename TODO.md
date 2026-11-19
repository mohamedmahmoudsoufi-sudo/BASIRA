# BASIRA MVP — Outcome checklist

## 1. Working analysis workspace
- [x] The user can submit a suspicious URL or message in a clear analysis workspace.
- [x] The analyzer never opens or fetches the submitted URL; it parses the string locally only.
- [x] The interface warns users not to enter passwords, OTPs, or other secrets.
- [x] The workspace includes a safe synthetic demo scenario that can be loaded and rerun.

## 2. Explainable fraud indicators
- [x] URL and message analysis extracts explainable indicators for domain, URL structure, urgency, sensitive-data requests, brand impersonation, and suspicious link patterns.
- [x] Risk Overview presents a comprehensible score, risk level, verdict, and short summary using probabilistic language.
- [x] Each indicator is labeled as Evidence, Inference, or Hypothesis.
- [x] The interface avoids claims of official bank/police integrations or proven accuracy.

## 3. Evidence and journey reconstruction
- [x] Evidence Explorer organizes the analyzed input and related synthetic evidence.
- [x] The Journey view presents a visual timeline with source and confidence/uncertainty.
- [x] Relationships between the message, link, domain, and possible next step are visible.
- [x] The journey is explicitly presented as a reviewable reconstruction, not a factual claim.

## 4. Protection and accessibility
- [x] Recommendations provide practical next steps: do not interact, verify through an official channel, report, and rotate exposed credentials without requesting secrets.
- [x] The interface supports English and Arabic labels with LTR/RTL switching.
- [x] The UI is responsive and uses readable contrast and keyboard-friendly controls.

## 5. Validation and handoff
- [x] Tests cover a benign URL, a suspicious URL, brand impersonation, a benign message, and a scam-like message.
- [x] README documents the architecture, safety boundary, demo scenario, and honest limitations.
- [x] `/manus-routes.json` declares the current page routes.
- [ ] Publish a checkpoint after the implementation is validated.
