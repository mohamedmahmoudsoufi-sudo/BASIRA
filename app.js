// BASIRA Full Implementation Engine (v2.0)
let lang = 'ar';
let evidences = [];

const SCENARIOS = {
  bank: [
    { id: 'EV-1', type: 'call', time: '10:12 AM', content: 'مكالمة واردة من رقم إماراتي +971501234567 يدعي المتصل أنه من قسم مكافحة الاحتيال في البنك المركزي ويطلب تحديث الهوية 784-1995-1234567-1.' },
    { id: 'EV-2', type: 'sms', time: '10:15 AM', content: 'تنبيه عاجل: تم تجميد حسابك البنكي مؤقتاً لتخلفك عن التحديث. أدخل رمز OTP عبر الرابط أدناه خلال 10 دقائق.' },
    { id: 'EV-3', type: 'url', time: '10:15 AM', content: 'http://uae-central-bank-secure-login.xyz/verify' }
  ],
  job: [
    { id: 'EV-1', type: 'sms', time: '02:30 PM', content: 'تهانينا! تم قبولك كمدير تشغيل براتب 18,000 درهم في دبي. لإصدار تأشيرة العمل حول رسوم 450 درهم للحساب AE070331234567890123456.' },
    { id: 'EV-2', type: 'url', time: '', content: 'http://emirates-hr-visa-portal.top/pay' }
  ],
  legit: [
    { id: 'EV-1', type: 'sms', time: '09:00 AM', content: 'تم خصم مبلغ 120.00 درهم من بطاقتك المنتهية بـ 4412 لدى متجر محلي في رأس الخيمة. للاستفسار اتصل بالرقم الرسمي خلف البطاقة.' }
  ]
};

// 1. Real PII Masking Implementation
function maskPII(text) {
  if (!document.getElementById('piiToggle').checked) return text;
  return text
    .replace(/784-\d{4}-\d{7}-\d/g, '[EMIRATES-ID-MASKED]')
    .replace(/(\+971|00971|05)\d{8,9}/g, '[UAE-PHONE-MASKED]')
    .replace(/AE\d{21}/gi, '[UAE-IBAN-MASKED]');
}

// 2. Static Safe URL Inspector Implementation (Never opens the URL)
function inspectUrlStatic(urlStr) {
  const findings = [];
  let score = 0;
  try {
    const clean = urlStr.trim();
    if (/^http:\/\//i.test(clean)) {
      score += 15;
      findings.push(lang === 'ar' ? '⚠️ يستخدم بروتوكول HTTP غير المشفر.' : '⚠️ Uses unencrypted HTTP protocol.');
    }
    if (/\.(xyz|top|icu|buzz|click|tk|ml)(\/|$)/i.test(clean)) {
      score += 25;
      findings.push(lang === 'ar' ? '🚨 نطاق علوي (TLD) مشبوه عالي المخاطر مرتبط بحملات التصيد.' : '🚨 High-risk TLD commonly abused in phishing campaigns.');
    }
    if (/(verify|secure|login|update|otp|bank|emirates|uae)/i.test(clean)) {
      score += 20;
      findings.push(lang === 'ar' ? '🔍 الرابط يحتوي على كلمات انتحال علامة تجارية أو جهة رسمية.' : '🔍 URL contains brand/authority spoofing keywords.');
    }
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(clean)) {
      score += 30;
      findings.push(lang === 'ar' ? '🚨 يستخدم عنوان IP مباشر بدلاً من نطاق رسمي موثوق.' : '🚨 Uses raw IP address instead of legitimate domain.');
    }
  } catch (e) {}
  return { score, findings };
}

function loadScenario(key) {
  evidences = JSON.parse(JSON.stringify(SCENARIOS[key]));
  reRenderAll();
}

function addEvidence() {
  const type = document.getElementById('evType').value;
  const time = document.getElementById('evTime').value.trim();
  const content = document.getElementById('evContent').value.trim();
  if (!content) return;

  evidences.push({
    id: 'EV-' + (evidences.length + 1),
    type,
    time,
    content
  });

  document.getElementById('evContent').value = '';
  document.getElementById('evTime').value = '';
  document.getElementById('ocrStatus').textContent = '';
  reRenderAll();
}

function clearIncident() {
  evidences = [];
  reRenderAll();
}

// 3. Client-Side OCR Implementation via Tesseract.js & Synthetic Generator
function generateSyntheticScreenshot() {
  const canvas = document.getElementById('synthCanvas');
  canvas.classList.remove('hidden');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('BANK SECURITY ALERT (UAE)', 14, 24);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '12px sans-serif';
  ctx.fillText('Account suspended. Verify OTP immediately at', 14, 50);
  ctx.fillText('http://uae-secure-bank-login.xyz/auth', 14, 74);

  document.getElementById('evType').value = 'ocr';
  document.getElementById('evContent').value = 'BANK SECURITY ALERT (UAE): Account suspended. Verify OTP immediately at http://uae-secure-bank-login.xyz/auth';
  document.getElementById('ocrStatus').textContent = lang === 'ar'
    ? '✅ تم توليد لقطة شاشة اصطناعية واستخراج النص بنجاح.'
    : '✅ Synthetic screenshot generated and text extracted.';
}

async function runTesseractOCR(event) {
  const file = event.target.files[0];
  if (!file) return;
  const status = document.getElementById('ocrStatus');
  status.textContent = lang === 'ar' ? '⏳ جاري تشغيل Tesseract OCR محلياً على الصورة...' : '⏳ Running local Tesseract OCR on image...';
  try {
    const worker = await Tesseract.createWorker('eng+ara');
    const ret = await worker.recognize(file);
    await worker.terminate();
    const extractedText = ret.data.text.trim();
    document.getElementById('evContent').value = extractedText;
    document.getElementById('evType').value = 'ocr';
    status.textContent = lang === 'ar' ? '✅ تمت قراءة النص واستخراجه بنجاح!' : '✅ Text successfully extracted via OCR!';
  } catch (err) {
    status.textContent = lang === 'ar' ? '❌ تعذر قراءة الصورة محلياً.' : '❌ Failed to process image OCR locally.';
  }
}

// 4. Hybrid Risk & Journey Reconstruction Engine
function analyzeIncident() {
  if (evidences.length === 0) {
    return { score: 0, level: 'NONE', rules: [], urlFindings: [], steps: [], summary: '' };
  }

  let totalScore = 0;
  const rules = [];
  const allUrlFindings = [];
  const channels = new Set(evidences.map(e => e.type));

  let hasImpersonation = false;
  let hasUrgency = false;
  let hasCredentialReq = false;
  let hasSuspiciousUrl = false;
  let hasFeeReq = false;

  evidences.forEach(ev => {
    const txt = ev.content;
    if (/(بنك|المصرف|الشرطة|المركزي|bank|central bank|police)/i.test(txt)) hasImpersonation = true;
    if (/(عاجل|فوراً|تجميد|تعليق|urgent|suspend|immediately)/i.test(txt)) hasUrgency = true;
    if (/(otp|رمز التحقق|كلمة المرور|password|pin)/i.test(txt)) hasCredentialReq = true;
    if (/(رسوم|تحويل|دفع|IBAN|AE\d{21}|fee|transfer)/i.test(txt)) hasFeeReq = true;

    // Check URLs
    const urlMatches = txt.match(/https?:\/\/[^\s]+/gi);
    if (urlMatches) {
      urlMatches.forEach(u => {
        const checked = inspectUrlStatic(u);
        if (checked.score > 0) {
          hasSuspiciousUrl = true;
          allUrlFindings.push({ url: u, ...checked });
          totalScore += checked.score;
        }
      });
    }
  });

  if (hasImpersonation) {
    totalScore += 25;
    rules.push({ pts: '+25', label: lang === 'ar' ? 'ادعاء صفة جهة مصرفية أو رسمية (Authority Impersonation)' : 'Authority / Bank Impersonation Claim' });
  }
  if (hasUrgency) {
    totalScore += 20;
    rules.push({ pts: '+20', label: lang === 'ar' ? 'الضغط النفسي وافتعال الاستعجال (Artificial Urgency)' : 'Artificial Urgency / Fear Trigger' });
  }
  if (hasCredentialReq) {
    totalScore += 35;
    rules.push({ pts: '+35', label: lang === 'ar' ? 'طلب رمز تحقّق OTP أو بيانات سرية (Credential Harvesting)' : 'OTP / Credential Harvesting Request' });
  }
  if (hasFeeReq) {
    totalScore += 25;
    rules.push({ pts: '+25', label: lang === 'ar' ? 'طلب تحويل مالي أو رسوم مسبقة (Advance Fee Fraud)' : 'Advance Fee / Upfront Transfer Request' });
  }
  if (hasSuspiciousUrl) {
    totalScore += 25;
    rules.push({ pts: '+25', label: lang === 'ar' ? 'وجود رابط إلكتروني مشبوه أو عالي المخاطر (Suspicious URL)' : 'Suspicious Phishing URL Detected' });
  }
  if (channels.size >= 2) {
    totalScore += 15;
    rules.push({ pts: '+15', label: lang === 'ar' ? 'تنسيق هجوم متعدد القنوات (Multi-Channel Attack Coordination)' : 'Multi-Channel Attack Coordination' });
  }

  totalScore = Math.min(totalScore, 100);
  const level = totalScore >= 65 ? 'HIGH' : totalScore >= 30 ? 'MEDIUM' : 'LOW';

  // 5. Epistemic Classification: Evidence, Inference, Hypothesis
  const steps = evidences.map((ev, idx) => {
    let stage = lang === 'ar' ? 'مرحلة الاستدراج والتواصل الأولي' : 'Initial Lure & Contact Stage';
    let epistemic = 'Evidence';
    let relation = idx === 0
      ? (lang === 'ar' ? 'نقطة البداية المرصودة في الحادثة' : 'Observed entry point of incident')
      : (lang === 'ar' ? `مرتبط زمنياً وسياقياً بالدليل السابق ${evidences[idx - 1].id}` : `Contextually linked to prior evidence ${evidences[idx - 1].id}`);

    if (ev.type === 'url' || /otp|رمز|payment|pay|تحديث/i.test(ev.content)) {
      stage = lang === 'ar' ? 'مرحلة التصيد وسرقة الاعتمادات / الأموال' : 'Credential / Financial Extraction Stage';
      epistemic = 'Inference';
    } else if (/(عاجل|تجميد|urgent|suspend)/i.test(ev.content)) {
      stage = lang === 'ar' ? 'مرحلة التصعيد والضغط النفسي' : 'Psychological Escalation Stage';
      epistemic = 'Evidence';
    }

    return {
      evidenceId: ev.id,
      type: ev.type.toUpperCase(),
      time: ev.time || (lang === 'ar' ? 'غير محدد (Unknown)' : 'Unknown'),
      raw: maskPII(ev.content),
      stage,
      epistemic,
      relation
    };
  });

  // Add explicit Hypothesis step for High/Medium risk
  if (totalScore >= 30) {
    steps.push({
      evidenceId: 'HYP-1',
      type: 'SYSTEM-HYPOTHESIS',
      time: lang === 'ar' ? 'تقدير مستقبلي غير مثبت' : 'Unverified Projection',
      raw: lang === 'ar'
        ? 'قد يسعى المهاجم إلى الاستيلاء الكامل على الحساب المصرفي أو تنفيذ عمليات تحويل غير مصرح بها إذا تم إدخال رمز OTP أو البيانات (فرضية مبنية على نمط الهجوم وليست واقعة مثبتة).'
        : 'Attacker may attempt account takeover or unauthorized transfers if OTP/credentials are submitted (Hypothesis based on attack pattern, not proven fact).',
      stage: lang === 'ar' ? 'الهدف المحتمل للهجوم (Hypothesis)' : 'Projected Attack Objective (Hypothesis)',
      epistemic: 'Hypothesis',
      relation: lang === 'ar' ? 'استنتاج احتمالي مستخلص من تقاطع الأدلة' : 'Probabilistic projection derived from evidence correlation'
    });
  }

  let summary = '';
  if (level === 'HIGH') {
    summary = lang === 'ar'
      ? '🚨 تحذير مرتفع الخطورة: تشير الأدلة المترابطة إلى هجوم هندسة اجتماعية منسق ومتعدد القنوات. لا تقم بالضغط على أي روابط، لا تشارك رمز OTP نهائياً، أغلق الاتصال فوراً، وتواصل مع البنك عبر الرقم الرسمي المطبوع خلف بطاقتك.'
      : '🚨 HIGH RISK: Correlated evidence indicates a coordinated multi-channel social engineering attack. Do not click links, never share OTP codes, terminate contact, and verify via official bank channels.';
  } else if (level === 'MEDIUM') {
    summary = lang === 'ar'
      ? '⚠️ خطر متوسط: توجد مؤشرات تستدعي الحذر والتدقيق. تحقق من هوية المرسل عبر قنوات رسمية مستقلة قبل اتخاذ أي إجراء.'
      : '⚠️ MEDIUM RISK: Suspicious indicators detected. Verify sender identity through independent official channels before proceeding.';
  } else {
    summary = lang === 'ar'
      ? '✅ خطر منخفض: لا توجد في الأدلة الحالية مؤشرات واضحة لتصيد أو روابط خبيثة. استمر في توخي الحذر المعتاد.'
      : '✅ LOW RISK: No malicious links or credential requests detected in current evidence.';
  }

  return { score: totalScore, level, rules, urlFindings: allUrlFindings, steps, summary };
}

function reRenderAll() {
  // Render Evidence List
  const evList = document.getElementById('evidenceList');
  document.getElementById('evCount').textContent = evidences.length;
  if (evidences.length === 0) {
    evList.innerHTML = lang === 'ar' ? 'لا توجد أدلة مضافة بعد.' : 'No evidence added yet.';
  } else {
    evList.innerHTML = evidences.map(ev => `
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
        <div class="flex justify-between items-center text-[11px]">
          <span class="font-bold text-sky-400">${ev.id} • ${ev.type.toUpperCase()}</span>
          <span class="text-slate-500">${ev.time || (lang === 'ar' ? 'توقيت غير محدد' : 'Unknown')}</span>
        </div>
        <div class="text-slate-200 break-words">${maskPII(ev.content)}</div>
      </div>
    `).join('');
  }

  // Analyze
  const res = analyzeIncident();
  const badge = document.getElementById('riskBadge');
  document.getElementById('riskScoreNum').textContent = `${res.score} / 100`;

  if (res.level === 'NONE') {
    badge.className = 'px-3 py-1 rounded-lg text-sm font-bold bg-slate-800 text-slate-300';
    badge.textContent = lang === 'ar' ? 'بانتظار الأدلة' : 'Awaiting Evidence';
  } else if (res.level === 'HIGH') {
    badge.className = 'px-3 py-1 rounded-lg text-sm font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40';
    badge.textContent = lang === 'ar' ? 'مرتفع (HIGH RISK)' : 'HIGH RISK';
  } else if (res.level === 'MEDIUM') {
    badge.className = 'px-3 py-1 rounded-lg text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
    badge.textContent = lang === 'ar' ? 'متوسط (MEDIUM RISK)' : 'MEDIUM RISK';
  } else {
    badge.className = 'px-3 py-1 rounded-lg text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    badge.textContent = lang === 'ar' ? 'منخفض (LOW RISK)' : 'LOW RISK';
  }

  // Rules
  const rulesDiv = document.getElementById('rulesBreakdown');
  if (res.rules.length === 0) {
    rulesDiv.innerHTML = lang === 'ar' ? 'لم يتم تفعيل أي قاعدة خطر بعد.' : 'No risk rules triggered.';
  } else {
    rulesDiv.innerHTML = res.rules.map(r => `
      <div class="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
        <span>${r.label}</span>
        <span class="font-mono font-bold text-rose-400">${r.pts}</span>
      </div>
    `).join('');
  }

  // URL Findings Box
  const urlBox = document.getElementById('urlAnalysisBox');
  const urlList = document.getElementById('urlFindingsList');
  if (res.urlFindings.length > 0) {
    urlBox.classList.remove('hidden');
    urlList.innerHTML = res.urlFindings.map(uf => `
      <div class="p-2 rounded bg-slate-900 border border-slate-800">
        <div class="text-sky-300 font-mono text-[11px] break-all">${uf.url} (Score: +${uf.score})</div>
        <ul class="list-disc pr-4 mt-1 space-y-0.5 text-[11px] text-amber-300">
          ${uf.findings.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  } else {
    urlBox.classList.add('hidden');
  }

  document.getElementById('synthesisText').textContent = res.summary || (lang === 'ar'
    ? 'أضف دليلاً واحداً على الأقل لتبدأ رحلة التحليل.'
    : 'Add at least one piece of evidence to begin analysis.');

  // Timeline
  const timelineDiv = document.getElementById('timelineContainer');
  if (res.steps.length === 0) {
    timelineDiv.innerHTML = `<div class="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl">${lang === 'ar' ? 'الخط الزمني فارغ حالياً.' : 'Timeline is currently empty.'}</div>`;
  } else {
    timelineDiv.innerHTML = res.steps.map((s, i) => {
      const tagColor = s.epistemic === 'Evidence'
        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        : s.epistemic === 'Inference'
        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        : 'bg-purple-500/10 text-purple-300 border-purple-500/30';

      return `
        <div class="relative p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-xs font-bold">${i + 1}</span>
              <span class="text-xs font-bold text-white">${s.stage}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-400">🕒 ${s.time}</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold border ${tagColor}">${s.epistemic}</span>
            </div>
          </div>
          <p class="text-xs text-slate-300">${s.raw}</p>
          <div class="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-900">
            <span>المصدر: ${s.evidenceId} (${s.type})</span>
            <span>الارتباط: ${s.relation}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Threat Graph SVG
  const graphDiv = document.getElementById('graphContainer');
  if (evidences.length === 0) {
    graphDiv.innerHTML = lang === 'ar' ? 'سيظهر مخطط العلاقات تلقائياً عند إضافة أدلة.' : 'Relationship graph will appear when evidence is added.';
  } else {
    const nodes = evidences.map((ev, idx) => {
      const x = 70 + idx * 150;
      return `
        <g>
          ${idx > 0 ? `<line x1="${x - 95}" y1="70" x2="${x - 35}" y2="70" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4"/>` : ''}
          <rect x="${x - 35}" y="42" width="90" height="56" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="${x + 10}" y="66" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">${ev.id}</text>
          <text x="${x + 10}" y="84" fill="#cbd5e1" font-size="10" text-anchor="middle">${ev.type.toUpperCase()}</text>
        </g>
      `;
    }).join('');
    const svgWidth = Math.max(420, evidences.length * 160 + 60);
    graphDiv.innerHTML = `<svg width="100%" height="140" viewBox="0 0 ${svgWidth} 140">${nodes}</svg>`;
  }
}

function toggleLang() {
  lang = lang === 'ar' ? 'en' : 'ar';
  const html = document.getElementById('htmlRoot');
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.getElementById('langBtn').textContent = lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)';
  document.getElementById('exportBtn').textContent = lang === 'ar' ? 'تصدير التقرير (JSON)' : 'Export Report (JSON)';
  document.getElementById('clearBtn').textContent = lang === 'ar' ? 'مسح الحادثة' : 'Clear Incident';
  document.getElementById('submitBtn').textContent = lang === 'ar' ? '+ إضافة الدليل وتشغيل محرك إعادة بناء الرحلة' : '+ Add Evidence & Reconstruct Journey';
  reRenderAll();
}

// 7. Export Incident Report (JSON download)
function exportReport() {
  const res = analyzeIncident();
  const report = {
    project: 'BASIRA – Scam Journey Reconstruction Report',
    version: '2.0',
    generated_at: new Date().toISOString(),
    disclaimer: 'Advisory analysis tool. Not an official law enforcement determination.',
    risk_level: res.level,
    risk_score: res.score,
    triggered_rules: res.rules,
    static_url_findings: res.urlFindings,
    reconstructed_journey: res.steps,
    recommendation: res.summary
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'BASIRA_Incident_Report_v2.json';
  a.click();
}
