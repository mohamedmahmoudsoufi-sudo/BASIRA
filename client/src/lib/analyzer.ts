export type Locale = "en" | "ar";
export type InputMode = "auto" | "url" | "message";
export type EvidenceKind = "evidence" | "inference" | "hypothesis";
export type RiskLevel = "low" | "medium" | "high";

export type Indicator = {
  id: string;
  label: string;
  detail: string;
  weight: number;
  kind: EvidenceKind;
};

export type EvidenceItem = {
  id: string;
  type: "message" | "url" | "domain" | "signal";
  title: string;
  value: string;
  kind: EvidenceKind;
  relation: string;
};

export type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  kind: EvidenceKind;
  confidence: number;
};

export type AnalysisResult = {
  id: string;
  inputType: "url" | "message";
  normalizedInput: string;
  score: number;
  risk: RiskLevel;
  verdict: string;
  summary: string;
  indicators: Indicator[];
  evidence: EvidenceItem[];
  timeline: TimelineEvent[];
  recommendations: string[];
  parsed: {
    hostname?: string;
    protocol?: string;
    path?: string;
    queryKeys?: string[];
  };
};

const BRAND_PROFILES = [
  { name: "Emirates NBD", tokens: ["emiratesnbd", "emirates-nbd", "enbd"], official: ["emiratesnbd.com"] },
  { name: "Microsoft", tokens: ["microsoft", "office365", "outlook"], official: ["microsoft.com", "office.com", "live.com"] },
  { name: "Apple", tokens: ["apple", "icloud"], official: ["apple.com", "icloud.com"] },
  { name: "PayPal", tokens: ["paypal"], official: ["paypal.com"] },
  { name: "Amazon", tokens: ["amazon", "prime"], official: ["amazon.com", "amazon.ae"] },
];

const SUSPICIOUS_TLDS = [".xyz", ".top", ".click", ".icu", ".shop", ".live", ".site", ".online", ".buzz"];
const URGENCY_WORDS = ["urgent", "immediately", "within 24", "suspended", "last warning", "verify now", "عاجل", "فوراً", "خلال 24", "موقوف", "تحقق الآن"];
const SENSITIVE_WORDS = ["password", "passcode", "otp", "one-time", "card number", "card details", "cvv", "bank details", "كلمة المرور", "رمز التحقق", "بطاقة", "الرقم السري"];
const ACTION_WORDS = ["login", "log-in", "signin", "verify", "confirm", "secure", "update", "تسجيل", "تحقق", "تأكيد", "تحديث"];

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function hostLooksOfficial(hostname: string, officialDomains: string[]) {
  return officialDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function indicator(id: string, label: string, detail: string, weight: number, kind: EvidenceKind = "evidence"): Indicator {
  return { id, label, detail, weight, kind };
}

function analyzeUrl(urlText: string) {
  const raw = urlText.trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL | undefined;
  try {
    url = new URL(withProtocol);
  } catch {
    return {
      normalizedInput: raw,
      indicators: [indicator("malformed-url", "Malformed URL", "The submitted value cannot be parsed as a standard web address.", 42)],
      parsed: {},
    };
  }

  const hostname = url.hostname.toLowerCase();
  const decoded = safeDecode(`${url.pathname}${url.search}`).toLowerCase();
  const indicators: Indicator[] = [];
  const matchedBrand = BRAND_PROFILES.find((brand) => brand.tokens.some((token) => hostname.includes(token) || decoded.includes(token)));
  const officialBrand = matchedBrand && hostLooksOfficial(hostname, matchedBrand.official);

  if (url.protocol !== "https:") {
    indicators.push(indicator("transport", "No encrypted transport", "The link uses HTTP, so the connection is not protected by HTTPS.", 18));
  }
  if (url.username || url.password) {
    indicators.push(indicator("credential-embedded", "Credential-like URL structure", "The URL contains text before the host, a pattern often used to disguise the real destination.", 24));
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    indicators.push(indicator("ip-host", "Direct IP host", "The destination is an IP address rather than a recognizable domain name.", 22));
  }
  if (hostname.startsWith("xn--") || hostname.includes(".xn--")) {
    indicators.push(indicator("punycode", "Encoded hostname", "The hostname uses punycode, which can make look-alike characters harder to recognize.", 22));
  }
  if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
    indicators.push(indicator("tld", "Higher-risk domain ending", `The domain ends with ${SUSPICIOUS_TLDS.find((tld) => hostname.endsWith(tld))}, which is treated as a review signal in this prototype.`, 14, "inference"));
  }
  if ((hostname.match(/-/g) ?? []).length >= 2) {
    indicators.push(indicator("hyphens", "Unusual hostname structure", "Multiple hyphens make the hostname harder to read and can be used in look-alike domains.", 12));
  }
  if (url.hostname.split(".").length > 3) {
    indicators.push(indicator("subdomain-depth", "Deep subdomain chain", "Several subdomain levels can hide the effective domain from a hurried reader.", 14));
  }
  if (matchedBrand && !officialBrand) {
    indicators.push(indicator("brand-impersonation", `Possible ${matchedBrand.name} impersonation`, `The hostname or path references ${matchedBrand.name}, but the effective domain is not an official domain in this local reference list.`, 32, "inference"));
  }
  if (ACTION_WORDS.some((word) => decoded.includes(word))) {
    indicators.push(indicator("action-path", "Action-oriented path", "The path includes sign-in, verification, or account-update language.", 16));
  }
  if (url.searchParams.size >= 3) {
    indicators.push(indicator("query-density", "Dense tracking parameters", "The URL contains several query parameters; this is not proof of fraud but increases review priority.", 8, "inference"));
  }
  if (urlText.length > 120) {
    indicators.push(indicator("long-url", "Long destination", "The URL is unusually long and may be difficult for a user to inspect manually.", 8, "inference"));
  }
  if (indicators.length === 0) {
    indicators.push(indicator("no-obvious-signal", "No obvious local rule hit", "This prototype did not find a strong structural signal. A clean result is not proof that a destination is safe.", 0, "evidence"));
  }

  return {
    normalizedInput: raw,
    indicators,
    parsed: { hostname, protocol: url.protocol.replace(":", ""), path: url.pathname, queryKeys: [...url.searchParams.keys()] },
  };
}

function analyzeMessage(message: string) {
  const lower = message.toLowerCase();
  const indicators: Indicator[] = [];
  const links = message.match(/(?:https?:\/\/|www\.)[^\s<>]+/gi) ?? [];
  const urgencyHits = URGENCY_WORDS.filter((word) => lower.includes(word.toLowerCase()));
  const sensitiveHits = SENSITIVE_WORDS.filter((word) => lower.includes(word.toLowerCase()));

  if (urgencyHits.length > 0) {
    indicators.push(indicator("urgency", "Pressure or urgency", `Detected language that pressures the recipient to act quickly: ${urgencyHits.slice(0, 2).join(", ")}.`, Math.min(24, 10 + urgencyHits.length * 5)));
  }
  if (sensitiveHits.length > 0) {
    indicators.push(indicator("sensitive-request", "Sensitive-data request", "The message appears to request credentials, payment details, or a verification code. Never enter these into an unverified page.", 30));
  }
  if (links.length > 0) {
    indicators.push(indicator("message-link", "Embedded link", "The message contains a link that should be inspected before any interaction.", 12));
  }
  if (/dear customer|valued customer|عميلنا العزيز|عزيزي العميل/i.test(message)) {
    indicators.push(indicator("generic-greeting", "Generic greeting", "The message uses a broad greeting rather than a verifiable account-specific reference.", 8, "inference"));
  }
  if (/(claim|reward|refund|prize|مكافأة|استرداد|جائزة|تعويض)/i.test(message)) {
    indicators.push(indicator("financial-lure", "Financial or reward lure", "The message uses a reward, refund, or financial benefit to encourage a quick action.", 16));
  }
  if (indicators.length === 0) {
    indicators.push(indicator("no-obvious-message-signal", "No obvious local rule hit", "The prototype did not find a strong message-pattern signal. This is not a guarantee of safety.", 0, "evidence"));
  }

  return { normalizedInput: message.trim(), indicators, links };
}

export function containsSecrets(input: string) {
  return /(password|passcode|one[- ]time password|otp|cvv|كلمة المرور|رمز التحقق|الرقم السري)/i.test(input);
}

export function analyzeSubmission(input: string, mode: InputMode = "auto"): AnalysisResult {
  const trimmed = input.trim();
  const looksLikeUrl = /^(?:https?:\/\/|www\.)/i.test(trimmed) || (/^[^\s]+\.[^\s]+$/.test(trimmed) && !/\s/.test(trimmed));
  const inputType: "url" | "message" = mode === "url" || (mode === "auto" && looksLikeUrl) ? "url" : "message";
  const urlResult = inputType === "url" ? analyzeUrl(trimmed) : undefined;
  const messageResult = inputType === "message" ? analyzeMessage(trimmed) : undefined;
  const indicators = urlResult?.indicators ?? messageResult?.indicators ?? [];
  const score = Math.min(99, Math.max(3, Math.round(indicators.reduce((total, item) => total + item.weight, 0))));
  const risk: RiskLevel = score >= 65 ? "high" : score >= 35 ? "medium" : "low";
  const riskWord = risk === "high" ? "High-risk" : risk === "medium" ? "Needs review" : "Lower-risk signal set";
  const verdict = inputType === "url" ? `${riskWord} destination` : `${riskWord} message`;
  const summary = risk === "high"
    ? "Multiple signals suggest this input may be part of a social-engineering flow. Do not interact; verify through a trusted channel."
    : risk === "medium"
      ? "Some indicators deserve a pause and independent verification before any action."
      : "No strong local rule hit was found, but automated analysis cannot guarantee that content is safe.";
  const evidence: EvidenceItem[] = [];
  evidence.push({ id: "submitted-input", type: inputType, title: inputType === "url" ? "Submitted URL" : "Submitted message", value: trimmed || "No input", kind: "evidence", relation: "Primary artifact" });
  if (urlResult?.parsed.hostname) {
    evidence.push({ id: "effective-domain", type: "domain", title: "Effective domain", value: urlResult.parsed.hostname, kind: "evidence", relation: "Resolved from the string only; no network request was made" });
  }
  indicators.filter((item) => item.weight > 0).slice(0, 4).forEach((item) => {
    evidence.push({ id: item.id, type: "signal", title: item.label, value: item.detail, kind: item.kind, relation: "Supports risk assessment" });
  });
  const link = messageResult?.links[0];
  if (link) {
    evidence.push({ id: "linked-url", type: "url", title: "Message link", value: link, kind: "evidence", relation: "Potential next-step artifact" });
  }

  const timeline: TimelineEvent[] = inputType === "message"
    ? [
        { id: "received", time: "09:14", title: "Message received", detail: "The suspicious message entered the case as the primary artifact.", kind: "evidence", confidence: 100 },
        { id: "pressure", time: "09:14", title: "Pressure language detected", detail: "Urgency or financial lure language may be designed to reduce deliberation time.", kind: "inference", confidence: 88 },
        { id: "link", time: "09:15", title: link ? "Link surfaced in message" : "Possible action requested", detail: link ? "A link is present and should be investigated without opening it." : "The message appears to request an action; the destination is unknown.", kind: link ? "evidence" : "hypothesis", confidence: link ? 100 : 62 },
        { id: "handoff", time: "09:15", title: "Potential handoff to impersonation page", detail: "This is a reviewable hypothesis, not a confirmed event.", kind: "hypothesis", confidence: 54 },
      ]
    : [
        { id: "submitted", time: "09:14", title: "URL submitted for inspection", detail: "The string was parsed locally; BASIRA did not visit the destination.", kind: "evidence", confidence: 100 },
        { id: "signals", time: "09:14", title: "Structural signals extracted", detail: `${indicators.filter((item) => item.weight > 0).length} non-zero local rule signals were found in the URL structure.`, kind: "evidence", confidence: 100 },
        { id: "impersonation", time: "09:15", title: "Possible impersonation path", detail: "The hostname/path may be trying to borrow trust from a known brand or account action.", kind: indicators.some((item) => item.id === "brand-impersonation") ? "inference" : "hypothesis", confidence: indicators.some((item) => item.id === "brand-impersonation") ? 84 : 48 },
        { id: "next-step", time: "09:15", title: "Likely next step", detail: "A user could be guided toward a login or data request; this remains unverified without page access.", kind: "hypothesis", confidence: 45 },
      ];

  return {
    id: "BS-1042",
    inputType,
    normalizedInput: trimmed,
    score,
    risk,
    verdict,
    summary,
    indicators,
    evidence,
    timeline,
    recommendations: risk === "high"
      ? ["Do not open, reply to, or forward the link.", "Verify the account through the official app or a manually typed official domain.", "Report the message to the relevant provider or your organization’s security team.", "If credentials were already entered, change them through the official channel and enable MFA."]
      : risk === "medium"
        ? ["Pause before clicking or replying.", "Check the sender and destination through an independent trusted channel.", "Do not share passwords, OTPs, or payment details.", "Keep the case open for a second reviewer if the decision is consequential."]
        : ["Treat the result as a signal, not a certificate of safety.", "Use the official app or a trusted bookmark for account actions.", "Do not disclose passwords, OTPs, or payment details to an unverified request."],
    parsed: urlResult?.parsed ?? {},
  };
}

export const DEMO_URL = "https://emiratesnbd-secure-check.xyz/verify/account?session=48291&continue=login";
export const DEMO_MESSAGE = "URGENT: Your Emirates NBD account will be suspended within 24 hours. Verify now and confirm your card details at https://emiratesnbd-secure-check.xyz/verify/account?session=48291";

export function demoAnalysis() {
  return analyzeSubmission(DEMO_URL, "url");
}
