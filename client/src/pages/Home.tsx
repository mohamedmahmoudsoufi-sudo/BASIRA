import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Code2,
  FileSearch,
  Fingerprint,
  Globe2,
  Info,
  Link2,
  LockKeyhole,
  MessageSquareText,
  Network,
  PanelLeft,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Terminal,
  Timer,
  TriangleAlert,
  Workflow,
  X,
} from "lucide-react";
import {
  analyzeSubmission,
  containsSecrets,
  DEMO_MESSAGE,
  DEMO_URL,
  demoAnalysis,
  type AnalysisResult,
  type EvidenceKind,
  type InputMode,
  type Locale,
  type RiskLevel,
} from "@/lib/analyzer";

const copy = {
  en: {
    workspace: "Workspace",
    cases: "Cases",
    method: "Method",
    online: "Local analysis engine online",
    case: "CASE BS-1042",
    eyebrow: "SCAM JOURNEY RECONSTRUCTION",
    title: "See the attack path\nbefore it sees you.",
    intro: "BASIRA connects the clues around a suspicious link or message, explains the risk, and turns a fragmented incident into a reviewable journey.",
    analyze: "Analyze safely",
    demo: "Load demo case",
    clear: "Clear",
    inputTitle: "New evidence",
    inputHint: "Paste a URL or suspicious message. BASIRA parses the text locally and never opens the destination.",
    url: "URL",
    message: "Message",
    auto: "Auto-detect",
    placeholder: "Paste a suspicious URL or message…",
    noSecrets: "Do not enter passwords, OTPs, card numbers, or other secrets.",
    secretDetected: "Potential secret detected. Remove passwords, OTPs, or card details before analysis.",
    riskOverview: "Risk overview",
    score: "Risk score",
    signals: "signals",
    evidence: "evidence",
    verdict: "Assessment",
    evidenceExplorer: "Evidence explorer",
    journey: "Scam journey",
    recommendations: "Recommendations",
    explanation: "Why this surfaced",
    kindEvidence: "Evidence",
    kindInference: "Inference",
    kindHypothesis: "Hypothesis",
    confidence: "confidence",
    source: "source",
    relation: "relation",
    reviewable: "Reviewable reconstruction",
    reviewableBody: "The journey below is an analyst aid built from local signals. It is not a confirmed record of what happened.",
    noOpen: "No network request was made",
    noOpenBody: "BASIRA only inspects the characters you submit. It does not visit, render, or download from the destination.",
    nextActions: "Next actions",
    methodTitle: "How BASIRA reasons",
    methodBody: "Deterministic signals first. AI-style explanation second. Every conclusion stays attached to the artifact that triggered it.",
    footer: "BASIRA / defensive analysis prototype",
    limits: "Prototype boundaries",
    limitsBody: "No reputation feed, browser rendering, or official police/bank integration is claimed in this build.",
    rerun: "Run again",
    artifact: "artifact",
    typedDomain: "effective domain",
    localRules: "local rules",
    riskHigh: "High risk",
    riskMedium: "Needs review",
    riskLow: "Lower risk",
  },
  ar: {
    workspace: "مساحة التحليل",
    cases: "القضايا",
    method: "المنهج",
    online: "محرك التحليل المحلي متصل",
    case: "القضية BS-1042",
    eyebrow: "إعادة بناء رحلة الاحتيال",
    title: "افهم مسار الهجوم\nقبل أن يصل إليك.",
    intro: "تربط بصيرة الأدلة المحيطة برابط أو رسالة مشبوهة، وتشرح المخاطر، وتحول الحادثة المتفرقة إلى رحلة قابلة للمراجعة.",
    analyze: "حلّل بأمان",
    demo: "تحميل حالة تجريبية",
    clear: "مسح",
    inputTitle: "دليل جديد",
    inputHint: "ألصق رابطًا أو رسالة مشبوهة. تحلل بصيرة النص محليًا ولا تفتح الوجهة أبدًا.",
    url: "رابط",
    message: "رسالة",
    auto: "اكتشاف تلقائي",
    placeholder: "ألصق رابطًا أو رسالة مشبوهة…",
    noSecrets: "لا تدخل كلمات مرور أو OTP أو أرقام بطاقات أو أي أسرار أخرى.",
    secretDetected: "تم اكتشاف ما قد يكون سرًا. احذف كلمات المرور أو OTP أو بيانات البطاقة قبل التحليل.",
    riskOverview: "نظرة على المخاطر",
    score: "درجة الخطر",
    signals: "مؤشرات",
    evidence: "أدلة",
    verdict: "التقييم",
    evidenceExplorer: "مستكشف الأدلة",
    journey: "رحلة الاحتيال",
    recommendations: "التوصيات",
    explanation: "لماذا ظهرت هذه النتيجة",
    kindEvidence: "دليل",
    kindInference: "استنتاج",
    kindHypothesis: "فرضية",
    confidence: "الثقة",
    source: "المصدر",
    relation: "العلاقة",
    reviewable: "إعادة بناء قابلة للمراجعة",
    reviewableBody: "الرحلة أدناه أداة مساعدة للمحلل مبنية على مؤشرات محلية، وليست سجلًا مؤكدًا لما حدث.",
    noOpen: "لم يتم إجراء أي طلب شبكة",
    noOpenBody: "تفحص بصيرة الأحرف التي تدخلها فقط، ولا تزور الوجهة أو تعرضها أو تنزل منها شيئًا.",
    nextActions: "الإجراءات التالية",
    methodTitle: "كيف تفكر بصيرة",
    methodBody: "مؤشرات حتمية أولًا، ثم تفسير شبيه بتفسير الذكاء الاصطناعي. كل استنتاج يبقى مرتبطًا بالدليل الذي سببه.",
    footer: "بصيرة / نموذج أولي للتحليل الدفاعي",
    limits: "حدود النموذج الأولي",
    limitsBody: "لا ندّعي في هذه النسخة وجود تغذية سمعة أو عرض للمتصفح أو تكامل رسمي مع الشرطة أو البنوك.",
    rerun: "تشغيل مجدد",
    artifact: "عنصر",
    typedDomain: "النطاق الفعلي",
    localRules: "قواعد محلية",
    riskHigh: "خطر مرتفع",
    riskMedium: "يحتاج مراجعة",
    riskLow: "خطر منخفض نسبيًا",
  },
} as const;

type Copy = (typeof copy)[keyof typeof copy];
type Tab = "overview" | "evidence" | "journey" | "recommendations";

function riskMeta(risk: RiskLevel, locale: Locale) {
  const labels = locale === "ar" ? { high: "مرتفع", medium: "مراجعة", low: "منخفض" } : { high: "HIGH", medium: "REVIEW", low: "LOW" };
  return labels[risk];
}

function kindLabel(kind: EvidenceKind, locale: Locale) {
  const labels = locale === "ar" ? { evidence: "دليل", inference: "استنتاج", hypothesis: "فرضية" } : { evidence: "Evidence", inference: "Inference", hypothesis: "Hypothesis" };
  return labels[kind];
}

function RiskBadge({ risk, locale }: { risk: RiskLevel; locale: Locale }) {
  return <span className={`risk-badge risk-${risk}`}><span className="risk-dot" />{riskMeta(risk, locale)}</span>;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 47;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="score-ring" aria-label={`Risk score ${score} out of 100`}>
      <svg viewBox="0 0 120 120" role="img">
        <circle className="ring-track" cx="60" cy="60" r={radius} />
        <circle className="ring-value" cx="60" cy="60" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset: offset }} />
      </svg>
      <div className="score-number"><strong>{score}</strong><span>/100</span></div>
    </div>
  );
}

function KindPill({ kind, locale }: { kind: EvidenceKind; locale: Locale }) {
  return <span className={`kind-pill kind-${kind}`}><span className="kind-mark" />{kindLabel(kind, locale)}</span>;
}

function AppIcon({ type }: { type: "url" | "message" | "domain" | "signal" }) {
  if (type === "message") return <MessageSquareText size={16} />;
  if (type === "domain") return <Globe2 size={16} />;
  if (type === "signal") return <Fingerprint size={16} />;
  return <Link2 size={16} />;
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [mode, setMode] = useState<InputMode>("auto");
  const [input, setInput] = useState(DEMO_URL);
  const [analysis, setAnalysis] = useState<AnalysisResult>(() => demoAnalysis());
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState("");
  const t = copy[locale];
  const rtl = locale === "ar";
  const secretDetected = useMemo(() => containsSecrets(input), [input]);
  const highSignals = analysis.indicators.filter((item) => item.weight > 0).length;

  function runAnalysis(value = input, nextMode = mode) {
    if (!value.trim() || containsSecrets(value)) return;
    setInput(value);
    setMode(nextMode);
    setAnalysis(analyzeSubmission(value, nextMode));
    setTab("overview");
    setToast(locale === "ar" ? "تم تحديث التحليل محليًا" : "Local analysis updated");
    window.setTimeout(() => setToast(""), 2600);
  }

  function loadDemo() {
    setInput(DEMO_URL);
    setMode("url");
    setAnalysis(demoAnalysis());
    setTab("overview");
  }

  const tabs: { id: Tab; label: string; icon: typeof ScanSearch }[] = [
    { id: "overview", label: t.riskOverview, icon: ScanSearch },
    { id: "evidence", label: t.evidenceExplorer, icon: FileSearch },
    { id: "journey", label: t.journey, icon: Workflow },
    { id: "recommendations", label: t.recommendations, icon: ClipboardCheck },
  ];

  return (
    <div className="basira-shell" dir={rtl ? "rtl" : "ltr"}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><span>ب</span></div>
          <div>
            <div className="brand-name">BASIRA<span> / بصيرة</span></div>
            <div className="brand-caption">Scam journey intelligence</div>
          </div>
        </div>
        <nav className="topnav" aria-label="Main navigation">
          <button className="nav-link active"><PanelLeft size={15} />{t.workspace}</button>
          <button className="nav-link"><Network size={15} />{t.cases}<span className="nav-count">04</span></button>
          <button className="nav-link"><Code2 size={15} />{t.method}</button>
        </nav>
        <div className="top-actions">
          <span className="engine-status"><span className="status-dot" />{t.online}</span>
          <button className="locale-toggle" onClick={() => setLocale(locale === "en" ? "ar" : "en")} aria-label="Switch language">
            {locale === "en" ? "عربي" : "EN"}
          </button>
          <button className="icon-button" aria-label="Notifications"><Bell size={17} /><span className="notification-dot" /></button>
          <div className="avatar">MB</div>
        </div>
      </header>

      <main className="main-content">
        <div className="case-strip">
          <span className="case-id"><span className="case-pulse" />{t.case}</span>
          <span className="case-separator" />
          <span className="case-context">Synthetic demo evidence <ChevronRight size={13} /> {analysis.inputType === "url" ? "URL inspection" : "Message triage"}</span>
          <span className="case-time"><Timer size={14} /> 09:15 UTC</span>
        </div>

        <section className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} />{t.eyebrow}</div>
            <h1>{t.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h1>
            <p>{t.intro}</p>
            <div className="hero-proof">
              <div className="proof-item"><span className="proof-icon cyan"><ScanSearch size={17} /></span><span><strong>09</strong><small>{t.localRules}</small></span></div>
              <div className="proof-item"><span className="proof-icon amber"><Workflow size={17} /></span><span><strong>04</strong><small>journey nodes</small></span></div>
              <div className="proof-item"><span className="proof-icon violet"><LockKeyhole size={17} /></span><span><strong>0</strong><small>external fetches</small></span></div>
            </div>
          </div>
          <div className="hero-side-note">
            <div className="note-label"><ShieldCheck size={16} /> Defensive by default</div>
            <p>{t.noOpenBody}</p>
            <div className="note-line"><span>MODE</span><strong>LOCAL / EXPLAINABLE</strong></div>
            <div className="note-line"><span>CASE STATE</span><strong>REVIEWABLE</strong></div>
          </div>
        </section>

        <section className="analysis-card">
          <div className="analysis-card-head">
            <div>
              <div className="section-kicker"><span className="kicker-line" />01 / {t.inputTitle}</div>
              <p>{t.inputHint}</p>
            </div>
            <div className="input-mode-toggle" role="group" aria-label="Input type">
              {(["auto", "url", "message"] as InputMode[]).map((item) => (
                <button key={item} className={mode === item ? "selected" : ""} onClick={() => setMode(item)}>{item === "auto" ? t.auto : item === "url" ? t.url : t.message}</button>
              ))}
            </div>
          </div>
          <div className="input-row">
            <div className="input-prefix"><Link2 size={18} /><span>{mode === "message" ? "TEXT" : "INPUT"}</span></div>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={t.placeholder} rows={3} aria-label={t.placeholder} />
            <div className="input-actions">
              <button className="clear-button" onClick={() => setInput("")} disabled={!input}><X size={15} />{t.clear}</button>
              <button className="primary-button" onClick={() => runAnalysis()} disabled={!input.trim() || secretDetected}><ScanSearch size={16} />{t.analyze}<ArrowUpRight size={16} /></button>
            </div>
          </div>
          <div className={`safety-line ${secretDetected ? "danger" : ""}`}><span className="safety-icon">{secretDetected ? <AlertTriangle size={13} /> : <LockKeyhole size={13} />}</span>{secretDetected ? t.secretDetected : t.noSecrets}</div>
          <div className="demo-row"><button onClick={loadDemo}><RefreshCw size={14} />{t.demo}</button><span>Safe synthetic scenario / no live destination access</span></div>
        </section>

        <section className="result-head">
          <div className="result-title-wrap"><div className="section-kicker"><span className="kicker-line" />02 / {t.riskOverview}</div><h2>{analysis.verdict}</h2><p>{analysis.summary}</p></div>
          <div className="result-metrics">
            <div className="metric-card accent-cyan"><span>{t.signals}</span><strong>{highSignals.toString().padStart(2, "0")}</strong><small>weighted hits</small></div>
            <div className="metric-card accent-amber"><span>{t.evidence}</span><strong>{analysis.evidence.length.toString().padStart(2, "0")}</strong><small>linked artifacts</small></div>
            <div className="metric-card accent-violet"><span>{t.artifact}</span><strong>{analysis.inputType === "url" ? "URL" : "MSG"}</strong><small>{analysis.inputType === "url" ? t.typedDomain : "triage"}</small></div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="primary-panel">
            <div className="risk-banner">
              <div className="risk-banner-main"><ScoreRing score={analysis.score} /><div><div className="mini-label">{t.score}</div><div className="risk-heading"><RiskBadge risk={analysis.risk} locale={locale} /></div><p>{t.verdict}: {analysis.verdict}</p></div></div>
              <div className="risk-banner-aside"><span className="mini-label">ENGINE NOTE</span><strong>Rule-based / explainable</strong><span>Every signal keeps its source and uncertainty visible.</span></div>
            </div>
            <div className="tabs" role="tablist">
              {tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "tab-active" : ""} onClick={() => setTab(id)} role="tab" aria-selected={tab === id}><Icon size={15} />{label}</button>)}
            </div>
            {tab === "overview" && <Overview result={analysis} locale={locale} t={t} />}
            {tab === "evidence" && <EvidenceExplorer result={analysis} locale={locale} t={t} />}
            {tab === "journey" && <Journey result={analysis} locale={locale} t={t} />}
            {tab === "recommendations" && <Recommendations result={analysis} locale={locale} t={t} />}
          </div>
          <aside className="right-rail">
            <div className="rail-card signal-card"><div className="rail-card-head"><span className="rail-index">A</span><div><h3>{t.explanation}</h3><p>Signals with context</p></div></div><div className="signal-list">{analysis.indicators.filter((item) => item.weight > 0).slice(0, 4).map((item) => <div className="signal-row" key={item.id}><span className="signal-score">+{item.weight}</span><div><strong>{item.label}</strong><p>{item.detail}</p></div></div>)}</div><button className="rail-link" onClick={() => setTab("evidence")}>Open evidence explorer <ArrowUpRight size={14} /></button></div>
            <div className="rail-card boundary-card"><div className="rail-card-head"><span className="rail-index violet-index"><Info size={14} /></span><div><h3>{t.limits}</h3><p>{t.limitsBody}</p></div></div><div className="boundary-list"><span><Check size={13} />Local parsing only</span><span><Check size={13} />No secrets collected</span><span><TriangleAlert size={13} />Not a safety guarantee</span></div></div>
          </aside>
        </section>

        <footer className="footer"><span>{t.footer}</span><span className="footer-right"><span className="footer-led" />v0.1 / synthetic evidence only <span>•</span> Built for responsible demos</span></footer>
      </main>
      {toast && <div className="toast"><Check size={15} />{toast}</div>}
    </div>
  );
}

function Overview({ result, locale, t }: { result: AnalysisResult; locale: Locale; t: Copy }) {
  return <div className="tab-content overview-content"><div className="panel-section"><div className="panel-title"><span>01</span><h3>{t.explanation}</h3><span className="title-rule" /></div><div className="indicator-grid">{result.indicators.map((item) => <div className={`indicator-card ${item.weight === 0 ? "muted-indicator" : ""}`} key={item.id}><div className="indicator-top"><KindPill kind={item.kind} locale={locale} /><span className="indicator-weight">{item.weight ? `+${item.weight}` : "—"}</span></div><strong>{item.label}</strong><p>{item.detail}</p></div>)}</div></div><div className="panel-section compact-section"><div className="panel-title"><span>02</span><h3>{t.nextActions}</h3><span className="title-rule" /></div><div className="action-grid">{result.recommendations.slice(0, 3).map((recommendation, index) => <div className="action-card" key={recommendation}><span>0{index + 1}</span><p>{recommendation}</p><ChevronRight size={15} /></div>)}</div></div></div>;
}

function EvidenceExplorer({ result, locale, t }: { result: AnalysisResult; locale: Locale; t: Copy }) {
  return <div className="tab-content evidence-content"><div className="evidence-toolbar"><div><span className="mini-label">{result.evidence.length.toString().padStart(2, "0")} {t.evidence}</span><p>Artifacts are kept separate from analyst interpretation.</p></div><button className="ghost-button" onClick={() => navigator.clipboard?.writeText(result.normalizedInput)}><ClipboardCheck size={14} />Copy primary artifact</button></div><div className="evidence-list">{result.evidence.map((item, index) => <div className="evidence-item" key={item.id}><div className="evidence-number">0{index + 1}</div><div className="evidence-type"><AppIcon type={item.type} /><span>{item.type}</span></div><div className="evidence-main"><div className="evidence-title-row"><strong>{item.title}</strong><KindPill kind={item.kind} locale={locale} /></div><p className="evidence-value">{item.value}</p><p className="evidence-relation"><span>{t.relation}</span> {item.relation}</p></div><ArrowUpRight className="evidence-arrow" size={16} /></div>)}</div></div>;
}

function Journey({ result, locale, t }: { result: AnalysisResult; locale: Locale; t: Copy }) {
  return <div className="tab-content journey-content"><div className="journey-callout"><div className="callout-icon"><Workflow size={17} /></div><div><strong>{t.reviewable}</strong><p>{t.reviewableBody}</p></div><span className="confidence-legend">100% = observed input</span></div><div className="timeline">{result.timeline.map((event, index) => <div className="timeline-event" key={event.id}><div className="timeline-marker"><span>{String(index + 1).padStart(2, "0")}</span></div><div className="timeline-body"><div className="timeline-meta"><span>{event.time} UTC</span><KindPill kind={event.kind} locale={locale} /><span className="confidence"><span className="confidence-bar"><i style={{ width: `${event.confidence}%` }} /></span>{event.confidence}% {t.confidence}</span></div><h3>{event.title}</h3><p>{event.detail}</p></div></div>)}</div></div>;
}

function Recommendations({ result, locale, t }: { result: AnalysisResult; locale: Locale; t: Copy }) {
  return <div className="tab-content recommendations-content"><div className="recommendation-intro"><div className="recommendation-icon"><ShieldAlert size={18} /></div><div><h3>Reduce the attacker’s next move.</h3><p>These actions are ordered for a high-friction, low-regret response. They do not require sharing any secret with BASIRA.</p></div></div><div className="recommendation-list">{result.recommendations.map((recommendation, index) => <div className="recommendation-item" key={recommendation}><span className="rec-number">0{index + 1}</span><div><strong>{index === 0 ? "Immediate" : index === 1 ? "Verify independently" : index === 2 ? "Report and contain" : "Recover safely"}</strong><p>{recommendation}</p></div><Check size={17} /></div>)}</div><div className="recommendation-foot"><CircleHelp size={15} /> {t.limitsBody}</div></div>;
}
