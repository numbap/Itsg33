// UI layer: hash routing, rendering and event handling. All data stays in the
// browser (localStorage), with JSON import/export for sharing assessments.

import {
  ANSWER_OPTIONS, APPLICABILITY, CONTROLS, CONTROL_MAP, FAMILIES, FAMILY_MAP, OVERRIDE_OPTIONS, STATUS,
  analyzeText, controlsByFamily, draftStatement, evaluateControl, fillTemplate, getAnswer, newState,
  scoreAssessment, STATE_VERSION,
} from "./engine.js";
import { CLASSES } from "./data/families.js";
import { PROFILE_FIELDS, PROFILE_DEFAULTS, PROFILE_LABELS, profileWarnings } from "./data/scoping.js";
import { buildReportModel, esc, reportToCSV, reportToHTML, reportToMarkdown } from "./report.js";

const STORAGE_KEY = "itsg33-navigator-state";
const app = document.getElementById("app");

// ------------------------------------------------------------------ state

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return newState();
}

function migrate(s) {
  const base = newState();
  return {
    ...base, ...s,
    version: STATE_VERSION,
    profile: { ...PROFILE_DEFAULTS, ...(s.profile ?? {}) },
    answers: s.answers ?? {},
    review: { ...base.review, ...(s.review ?? {}) },
  };
}

let state = load();
let saveTimer;

function save() {
  state.updatedAt = new Date().toISOString();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, 250);
}

function setAnswer(id, patch) {
  state.answers[id] = { ...getAnswer(state, id), ...patch };
  save();
}

// ------------------------------------------------------------------ helpers

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2400);
}

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = () => (state.profile.productName || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
const pct = (x) => `${Math.round(x * 100)}%`;
const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

function pills(r) {
  return `<span class="pill app-${r.applicability.status}" title="${esc(APPLICABILITY[r.applicability.status].help)}">${APPLICABILITY[r.applicability.status].label}</span>
    <span class="pill st-${r.status}">${STATUS[r.status].label}</span>`;
}

function progressRing(value, label) {
  const deg = Math.round(value * 360);
  return `<div class="ring" style="--deg:${deg}deg" role="img" aria-label="${label} ${pct(value)}"><span>${pct(value)}</span></div>`;
}

// ------------------------------------------------------------------ views

function viewHome() {
  const sc = scoreAssessment(state).overall;
  const started = Object.keys(state.answers).length > 0 || state.profile.productName;
  return `
  <section class="hero">
    <div>
      <h1>Walk the Gemba for every ITSG-33 requirement</h1>
      <p class="lead">Scope your product, review its documentation, answer a guided questionnaire and generate an ITSG-33 compliance report with a gap register, POA&amp;M and draft implementation statements.</p>
      <p>For each control you get the <em>Gemba walk</em>: where to go and look, how the product could be designed to <strong>eliminate</strong> the requirement, what happens if you <strong>break</strong> it, how to <strong>mitigate</strong>, and how to <strong>describe</strong> it to an assessor.</p>
      <div class="actions">
        <a class="btn primary" href="#/profile">${started ? "Continue assessment" : "Start an assessment"}</a>
        <a class="btn" href="#/library">Browse the Gemba library</a>
      </div>
    </div>
    ${started ? `<div class="hero-stats card">
      <h2 class="h4">${esc(state.profile.productName || "Current assessment")}</h2>
      <div class="ring-row">${progressRing(sc.progress, "Progress")}<div><strong>Progress</strong><br><span class="muted">${sc.assessed} of ${sc.inScope} in-scope controls</span></div></div>
      <div class="ring-row">${progressRing(sc.score, "Compliance")}<div><strong>Weighted compliance</strong><br><span class="muted">so far</span></div></div>
    </div>` : ""}
  </section>

  <section class="steps-grid">
    <a class="card step" href="#/profile"><b>1</b><h3>Scope the product</h3><p>A short interview about hosting, identity, users and data decides which of the ${CONTROLS.length} controls apply, which are inherited and which drop out.</p></a>
    <a class="card step" href="#/review"><b>2</b><h3>Review its documents</h3><p>Paste or upload security whitepapers, architecture notes or vendor answers. The review maps statements to controls and flags caveats.</p></a>
    <a class="card step" href="#/assess"><b>3</b><h3>Answer the questionnaire</h3><p>Plain-language questions per control, with the Gemba walk alongside to explain what each requirement really asks for.</p></a>
    <a class="card step" href="#/report"><b>4</b><h3>Generate the report</h3><p>Executive summary, family scores, design opportunities, risk-ranked gaps with consequences and mitigations, and implementation statements.</p></a>
  </section>

  <section class="card">
    <h2 class="h4">Your data</h2>
    <p class="muted">Everything is saved in this browser only. Export the assessment to share it or move it to another computer.</p>
    <div class="actions">
      <button class="btn" data-action="export-json">Export assessment (JSON)</button>
      <label class="btn">Import assessment<input type="file" accept="application/json,.json" data-action="import-json" hidden></label>
      <button class="btn" data-action="load-sample">Load sample product</button>
      <button class="btn danger" data-action="reset">Start over</button>
    </div>
  </section>`;
}

function fieldHTML(f) {
  const v = state.profile[f.id] ?? "";
  let input;
  if (f.type === "text") input = `<input type="text" id="p-${f.id}" data-profile="${f.id}" value="${esc(v)}" placeholder="${esc(f.placeholder ?? "")}">`;
  else if (f.type === "textarea") input = `<textarea id="p-${f.id}" data-profile="${f.id}" rows="3" placeholder="${esc(f.placeholder ?? "")}">${esc(v)}</textarea>`;
  else {
    const opts = f.type === "yesno" ? [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }] : f.options;
    input = `<div class="choices" role="radiogroup" aria-labelledby="l-${f.id}">${opts.map((o) => `
      <label class="choice"><input type="radio" name="p-${f.id}" value="${o.value}" data-profile="${f.id}" ${v === o.value ? "checked" : ""}><span>${esc(o.label)}</span></label>`).join("")}</div>`;
  }
  return `<div class="field">
    <label class="field-label" id="l-${f.id}" ${["text", "textarea"].includes(f.type) ? `for="p-${f.id}"` : ""}>${esc(f.label)}</label>
    ${input}
    <p class="why"><span>Why we ask:</span> ${esc(f.why)}</p>
  </div>`;
}

function scopeSummary() {
  const counts = { applicable: 0, shared: 0, inherited: 0, na: 0 };
  const changed = [];
  for (const c of CONTROLS) {
    const r = evaluateControl(c, state);
    counts[r.applicability.status]++;
    if (r.applicability.status !== "applicable") changed.push(r);
  }
  const warnings = profileWarnings(state.profile);
  return `
    <h2 class="h4">What this scope means</h2>
    <div class="scope-counts">
      ${Object.entries(counts).map(([k, n]) => `<div class="sc sc-${k}"><b>${n}</b><span>${APPLICABILITY[k].label}</span></div>`).join("")}
    </div>
    ${warnings.length ? `<div class="callout warn">${list(warnings)}</div>` : ""}
    <details class="scope-detail"><summary>Show controls removed or shared (${changed.length})</summary>
      <ul class="tight">${changed.map((r) => `<li><a href="#/control/${r.control.id}">${r.control.id}</a> <span class="pill app-${r.applicability.status}">${APPLICABILITY[r.applicability.status].label}</span> ${esc(r.applicability.reason)}</li>`).join("")}</ul>
    </details>`;
}

function viewProfile() {
  const groups = [
    ["The product", ["productName", "org", "description"]],
    ["Information sensitivity", ["classification", "integrity", "availability"]],
    ["Operating model", ["operator", "hosting", "development"]],
    ["People and identity", ["identity", "userBase"]],
    ["Exposure and connections", ["internetFacing", "publicContent", "interconnections", "remoteMaintenance", "wireless", "mobile", "removableMedia"]],
  ];
  const byId = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.id, f]));
  return `
  <div class="page-head"><h1>1. Scope the product</h1>
    <p class="lead">Answer what you know. Each answer changes which ITSG-33 controls apply. The right-hand panel shows the effect as you go.</p></div>
  <div class="split">
    <form class="profile-form" onsubmit="return false">
      ${groups.map(([title, ids]) => `<fieldset class="card"><legend>${title}</legend>${ids.map((id) => fieldHTML(byId[id])).join("")}</fieldset>`).join("")}
      <div class="actions"><a class="btn primary" href="#/review">Next: review documents</a><a class="btn" href="#/assess">Skip to questionnaire</a></div>
    </form>
    <aside class="card sticky" id="scope-summary">${scopeSummary()}</aside>
  </div>`;
}

function viewReview() {
  const res = state.review.results;
  let results = "";
  if (res) {
    const fieldLabel = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.id, f.label]));
    const hints = res.hints.filter((h) => state.profile[h.field] !== h.value);
    results = `
      <section class="card">
        <h2 class="h4">Findings</h2>
        <p>Read ${res.sentenceCount} sentences. Found statements relevant to <strong>${res.covered}</strong> of ${CONTROLS.length} controls.
        Matches are leads to verify on your Gemba walk, not proof.</p>
        ${hints.length ? `<h3 class="h5">Suggested scope changes</h3><ul class="hints">${hints.map((h) => `
          <li><div><strong>${esc(fieldLabel[h.field])}</strong> → ${esc(PROFILE_LABELS[h.field]?.[h.value] ?? (h.value === "yes" ? "Yes" : h.value))}
          <blockquote>${esc(h.evidence)}</blockquote></div>
          <button class="btn small" data-action="apply-hint" data-field="${h.field}" data-value="${h.value}">Apply</button></li>`).join("")}</ul>` : ""}
        <div class="actions"><button class="btn" data-action="copy-evidence">Copy evidence into questionnaire notes</button></div>
      </section>
      ${FAMILIES.map((f) => {
        const items = controlsByFamily(f.id).filter((c) => res.controls[c.id]);
        if (!items.length) return "";
        return `<section class="card"><h3 class="h5">${f.id}: ${esc(f.name)}</h3>${items.map((c) => {
          const m = res.controls[c.id];
          return `<div class="finding ${m.signal}">
            <div class="finding-head"><a href="#/assess/${f.id}/${c.id}"><strong>${c.id}</strong> ${esc(c.title)}</a>
            <span class="pill ${m.signal === "evidence" ? "st-implemented" : "st-partial"}">${m.signal === "evidence" ? "Evidence found" : "Only caveated mentions"}</span></div>
            <div class="muted small">Matched: ${m.terms.map(esc).join(", ")}</div>
            ${m.evidence.map((s) => `<blockquote>${esc(s)}</blockquote>`).join("")}
            ${m.caveats.map((s) => `<blockquote class="caveat" title="Contains wording such as 'not', 'planned' or 'optional'">${esc(s)}</blockquote>`).join("")}
          </div>`;
        }).join("")}</section>`;
      }).join("")}
      <section class="card"><h3 class="h5">No evidence found for</h3>
        <p class="muted small">${CONTROLS.filter((c) => !res.controls[c.id] && evaluateControl(c, state).applicability.status !== "na").map((c) => `<a href="#/control/${c.id}">${c.id}</a>`).join(" · ")}</p>
        <p class="small">Ask the vendor or team specifically about these. The Gemba library has suggested questions for each.</p></section>`;
  }
  return `
  <div class="page-head"><h1>2. Review product documentation</h1>
  <p class="lead">Paste security documentation: a vendor security whitepaper, architecture description, SOC 2 summary, questionnaire responses or design notes.
  The review maps each statement to ITSG-33 controls, flags caveats such as “planned” or “optional”, and suggests scope changes.</p></div>
  <section class="card">
    <label class="field-label" for="review-text">Documentation text</label>
    <textarea id="review-text" rows="12" placeholder="e.g. The service is hosted in Microsoft Azure Canada Central and Canada East. Users sign in with SAML single sign-on and MFA is enforced...">${esc(state.review.text)}</textarea>
    <div class="actions">
      <button class="btn primary" data-action="analyze">Analyze</button>
      <label class="btn">Load text file<input type="file" accept=".txt,.md,.markdown,.csv,.json,.html,.htm,text/*" data-action="load-text" hidden></label>
      <button class="btn" data-action="sample-text">Use sample text</button>
      ${res ? `<button class="btn" data-action="clear-review">Clear results</button>` : ""}
    </div>
    <p class="muted small">Text is processed in your browser and never uploaded. For PDF or Word documents, copy and paste the text.</p>
  </section>
  ${results}`;
}

function sidebar(activeFam) {
  const sc = scoreAssessment(state);
  return `<nav class="fam-nav" aria-label="Control families">
    ${Object.entries(CLASSES).map(([cls, label]) => `
      <div class="fam-class">${label}</div>
      ${FAMILIES.filter((f) => f.cls === cls).map((f) => {
        const s = sc.byFamily[f.id];
        return `<a href="#/assess/${f.id}" class="${f.id === activeFam ? "active" : ""}" data-fam="${f.id}">
          <span><b>${f.id}</b> ${esc(f.name)}</span>
          <span class="fam-prog" title="${s.assessed} of ${s.inScope} assessed">${s.inScope ? `${s.assessed}/${s.inScope}` : "—"}</span></a>`;
      }).join("")}`).join("")}
  </nav>`;
}

function gembaTabs(c) {
  const desc = fillTemplate(c.describe, state.profile);
  const tabs = [
    ["look", "Go & see", `<p class="muted small">Go to where the work happens. Ask for these, or look yourself:</p>${list(c.look)}`],
    ["eliminate", "Eliminate it", `<p class="muted small">Design choices that remove or shrink this requirement:</p>${list(c.eliminate)}`],
    ["break", "If you break it", `<p class="muted small">Consequences of not meeting this control:</p>${list(c.consequences)}`],
    ["mitigate", "Mitigate", `<p class="muted small">Compensating measures when it can't be fully met:</p>${list(c.mitigations)}`],
    ["describe", "Describe it", `<p class="muted small">A starting point for the implementation statement:</p><blockquote>${esc(desc)}</blockquote>
      <p class="small"><strong>Writing tips:</strong> name the mechanism (not the intent), say who does it and how often, name the tool or service, and point to evidence an assessor can check. Avoid “will” and “should”: describe what is true today, and put the rest in the POA&amp;M.</p>`],
  ];
  return `<div class="gemba" data-gemba="${c.id}">
    <div class="tabs" role="tablist">${tabs.map(([k, label], i) => `<button type="button" role="tab" class="tab ${i === 0 ? "on" : ""}" data-tab="${k}" aria-selected="${i === 0}">${label}</button>`).join("")}</div>
    ${tabs.map(([k, , body], i) => `<div class="tab-panel" role="tabpanel" data-panel="${k}" ${i === 0 ? "" : "hidden"}>${body}</div>`).join("")}
  </div>`;
}

function controlBody(c) {
  const r = evaluateControl(c, state);
  const a = r.answer;
  const out = r.applicability.status === "na" || r.applicability.status === "inherited";
  const rev = state.review.results?.controls?.[c.id];
  return `
    <p>${esc(c.summary)}</p>
    <div class="app-row">
      <label>Applicability
        <select data-field="applicability" data-id="${c.id}">
          <option value="">Automatic${a.applicability ? "" : ` (${APPLICABILITY[r.applicability.status].label})`}</option>
          ${Object.entries(APPLICABILITY).map(([k, v]) => `<option value="${k}" ${a.applicability === k ? "selected" : ""}>${v.label}</option>`).join("")}
        </select></label>
      ${r.applicability.reason ? `<span class="muted small">${esc(r.applicability.reason)}</span>` : ""}
    </div>
    ${gembaTabs(c)}
    ${rev ? `<div class="callout info small"><strong>From document review:</strong>${[...rev.evidence, ...rev.caveats].slice(0, 3).map((s) => `<blockquote>${esc(s)}</blockquote>`).join("")}</div>` : ""}
    ${out ? `<p class="callout muted">No questionnaire needed: this control is ${APPLICABILITY[r.applicability.status].label.toLowerCase()}. Keep the provider's evidence on file, or change applicability above if this is wrong.</p>` : `
    <div class="questions">
      <h4 class="h5">Questions</h4>
      ${c.questions.map((q, i) => `<fieldset class="q"><legend>${esc(q)}</legend><div class="seg">
        ${ANSWER_OPTIONS.map((o) => `<label class="seg-opt seg-${o.value}"><input type="radio" name="${c.id}.q${i}" value="${o.value}" data-q="${i}" data-id="${c.id}" ${a.q[i] === o.value ? "checked" : ""}><span>${o.label}</span></label>`).join("")}
      </div></fieldset>`).join("")}
    </div>
    <div class="grid2">
      <label>Evidence and notes<textarea rows="3" data-field="notes" data-id="${c.id}" placeholder="What you saw on the Gemba walk: documents, screenshots, configuration, interviews">${esc(a.notes)}</textarea></label>
      <label>Compensating measures in place<textarea rows="3" data-field="compensating" data-id="${c.id}" placeholder="If not fully met, what reduces the risk today?">${esc(a.compensating)}</textarea></label>
      <label>Remediation plan<textarea rows="2" data-field="plan" data-id="${c.id}" placeholder="What will be done, by whom">${esc(a.plan)}</textarea></label>
      <div class="stack">
        <label>Target date<input type="date" data-field="target" data-id="${c.id}" value="${esc(a.target)}"></label>
        <label>Status override
          <select data-field="override" data-id="${c.id}">
            <option value="">Derive from answers</option>
            ${OVERRIDE_OPTIONS.map((k) => `<option value="${k}" ${a.override === k ? "selected" : ""}>${STATUS[k].label}</option>`).join("")}
          </select></label>
      </div>
    </div>`}
    <label class="block">Implementation statement
      <textarea rows="4" data-field="statement" data-id="${c.id}" placeholder="Leave empty to use the generated draft in the report">${esc(a.statement)}</textarea></label>
    <div class="actions"><button type="button" class="btn small" data-action="draft" data-id="${c.id}">Generate draft statement</button>
    <a class="btn small ghost" href="#/control/${c.id}">Open full Gemba page</a></div>`;
}

function controlCard(c, open) {
  const r = evaluateControl(c, state);
  return `<details class="ctl" id="c-${c.id}" data-id="${c.id}" ${open ? "open" : ""}>
    <summary><span class="cid">${c.id}</span><span class="ctitle">${esc(c.title)}</span>
      <span class="sev sev-${c.sev}" title="Baseline severity">${c.sev}</span><span class="pills">${pills(r)}</span></summary>
    <div class="ctl-body">${open ? controlBody(c) : ""}</div>
  </details>`;
}

function viewAssess(famId, ctlId) {
  const fam = FAMILY_MAP[famId] ?? FAMILIES[0];
  const idx = FAMILIES.indexOf(fam);
  const next = FAMILIES[idx + 1];
  const prev = FAMILIES[idx - 1];
  const s = scoreAssessment(state).byFamily[fam.id];
  return `
  <div class="assess">
    <aside class="side">${sidebar(fam.id)}</aside>
    <section>
      <div class="page-head fam-head">
        <div><div class="eyebrow">${CLASSES[fam.cls]} class · 3. Questionnaire</div><h1>${fam.id}: ${esc(fam.name)}</h1>
        <p class="lead">${esc(fam.intent)}</p>
        <p class="gemba-tip"><strong>Gemba tip:</strong> ${esc(fam.gemba)}</p></div>
        <div class="fam-score">${progressRing(s.score, "Family compliance")}<span class="muted small">${s.assessed}/${s.inScope} assessed</span></div>
      </div>
      <div class="toolbar"><button class="btn small" data-action="expand-all">Expand all</button><button class="btn small" data-action="collapse-all">Collapse all</button></div>
      <div class="ctl-list">${controlsByFamily(fam.id).map((c) => controlCard(c, c.id === ctlId)).join("")}</div>
      <div class="actions pager">
        ${prev ? `<a class="btn" href="#/assess/${prev.id}">← ${prev.id} ${esc(prev.name)}</a>` : `<a class="btn" href="#/review">← Review documents</a>`}
        ${next ? `<a class="btn primary" href="#/assess/${next.id}">${next.id} ${esc(next.name)} →</a>` : `<a class="btn primary" href="#/report">Generate report →</a>`}
      </div>
    </section>
  </div>`;
}

function viewLibrary(query = "", cls = "") {
  const q = query.toLowerCase();
  const items = CONTROLS.filter((c) => (!cls || FAMILY_MAP[c.family].cls === cls) &&
    (!q || [c.id, c.title, c.summary, ...c.eliminate, ...c.keywords].join(" ").toLowerCase().includes(q)));
  return `
  <div class="page-head"><h1>Gemba library</h1>
    <p class="lead">Every control with its Gemba walk: go and see, eliminate by design, consequences, mitigations and how to describe it.</p></div>
  <div class="filters card">
    <input type="search" id="lib-q" placeholder="Search controls, e.g. MFA, backup, data residency" value="${esc(query)}" aria-label="Search controls">
    <select id="lib-cls" aria-label="Filter by class"><option value="">All classes</option>${Object.entries(CLASSES).map(([k, v]) => `<option value="${k}" ${cls === k ? "selected" : ""}>${v}</option>`).join("")}</select>
    <span class="muted small">${items.length} controls</span>
  </div>
  <div class="lib-grid">${items.map((c) => {
    const r = evaluateControl(c, state);
    return `<a class="card lib-item" href="#/control/${c.id}">
      <div class="lib-top"><span class="cid">${c.id}</span><span class="sev sev-${c.sev}">${c.sev}</span>${pills(r)}</div>
      <h3 class="h5">${esc(c.title)}</h3><p class="small muted">${esc(c.summary)}</p>
      <p class="small"><strong>Eliminate:</strong> ${esc(c.eliminate[0])}</p></a>`;
  }).join("")}</div>`;
}

function viewControl(id) {
  const c = CONTROL_MAP[id];
  if (!c) return `<p>Unknown control ${esc(id)}. <a href="#/library">Back to the library</a></p>`;
  const f = FAMILY_MAP[c.family];
  const r = evaluateControl(c, state);
  const i = CONTROLS.indexOf(c);
  const prev = CONTROLS[i - 1];
  const next = CONTROLS[i + 1];
  return `
  <div class="page-head">
    <div class="eyebrow"><a href="#/library">Gemba library</a> / ${f.id} ${esc(f.name)}</div>
    <h1>${c.id}: ${esc(c.title)}</h1>
    <div class="pills">${pills(r)} <span class="sev sev-${c.sev}">${c.sev} severity</span></div>
    <p class="lead">${esc(c.summary)}</p>
    ${r.applicability.reason ? `<p class="callout info">${esc(r.applicability.reason)}</p>` : ""}
  </div>
  <div class="gemba-page">
    <section class="card g-look"><h2 class="h4">Go &amp; see</h2><p class="muted small">Where to look and what evidence to ask for.</p>${list(c.look)}</section>
    <section class="card g-elim"><h2 class="h4">Eliminate it by design</h2><p class="muted small">How the product could be implemented so this requirement disappears or shrinks.</p>${list(c.eliminate)}</section>
    <section class="card g-break"><h2 class="h4">If you break it</h2><p class="muted small">Consequences of not meeting this control.</p>${list(c.consequences)}</section>
    <section class="card g-mit"><h2 class="h4">Mitigate</h2><p class="muted small">Compensating measures when full compliance isn't possible yet.</p>${list(c.mitigations)}</section>
    <section class="card g-desc wide"><h2 class="h4">Describe it</h2>
      <p class="muted small">Draft implementation statement for this product, based on your scoping answers:</p>
      <blockquote>${esc(draftStatement(c, state))}</blockquote>
      <p class="small"><strong>Make it assessable:</strong> replace generic phrases with the actual tool, setting, frequency and the record that proves it (e.g. “Entra ID Conditional Access policy CA-01 requires MFA for all users; sign-in logs are retained 90 days”).</p></section>
    <section class="card g-ask wide"><h2 class="h4">Ask</h2><p class="muted small">Questions to understand whether, and how, the requirement is met.</p>${list(c.questions)}
      <p class="small muted">Look for these terms in vendor documentation: ${c.keywords.map((k) => `<code>${esc(k.replace(/\*$/, ""))}</code>`).join(" ")}</p></section>
  </div>
  <div class="actions pager">
    ${prev ? `<a class="btn" href="#/control/${prev.id}">← ${prev.id}</a>` : "<span></span>"}
    <a class="btn primary" href="#/assess/${c.family}/${c.id}">Assess this control</a>
    ${next ? `<a class="btn" href="#/control/${next.id}">${next.id} →</a>` : "<span></span>"}
  </div>`;
}

function viewReport() {
  const m = buildReportModel(state);
  return `
  <div class="page-head no-print"><h1>4. Compliance report</h1>
    <p class="lead">Generated from your scope, document review and questionnaire answers. Update answers at any time and the report updates.</p>
    <div class="actions">
      <button class="btn primary" data-action="print">Print / save as PDF</button>
      <button class="btn" data-action="export-md">Download Markdown</button>
      <button class="btn" data-action="export-csv">Download CSV (control list)</button>
      <button class="btn" data-action="export-json">Export assessment (JSON)</button>
    </div></div>
  <div class="card report-wrap">${reportToHTML(m)}</div>`;
}

// ------------------------------------------------------------------ routing

let libQuery = "";
let libCls = "";

function route() {
  const [, view = "", a, b] = location.hash.replace(/^#/, "").split("/");
  const nav = { "": "home", profile: "profile", review: "review", assess: "assess", report: "report", library: "library", control: "library" }[view] ?? "home";
  document.querySelectorAll("[data-nav]").forEach((el) => el.classList.toggle("active", el.dataset.nav === nav));
  let html;
  switch (view) {
    case "profile": html = viewProfile(); break;
    case "review": html = viewReview(); break;
    case "assess": html = viewAssess(a, b); break;
    case "report": html = viewReport(); break;
    case "library": html = viewLibrary(libQuery, libCls); break;
    case "control": html = viewControl(a); break;
    default: html = viewHome();
  }
  app.innerHTML = html;
  document.title = `${nav === "home" ? "" : `${nav[0].toUpperCase()}${nav.slice(1)} · `}ITSG-33 Compliance Navigator`;
  if (view === "assess" && b) document.getElementById(`c-${b}`)?.scrollIntoView({ block: "start" });
  else window.scrollTo(0, 0);
}

// Refresh the parts of the questionnaire that depend on an answer without
// re-rendering the whole page (which would steal focus from inputs).
function refreshControl(id, rebuildBody = false) {
  const card = document.getElementById(`c-${id}`);
  if (!card) return;
  const r = evaluateControl(CONTROL_MAP[id], state);
  card.querySelector(".pills").innerHTML = pills(r);
  if (rebuildBody) card.querySelector(".ctl-body").innerHTML = controlBody(CONTROL_MAP[id]);
  const famId = CONTROL_MAP[id].family;
  const side = document.querySelector(".side");
  if (side) side.innerHTML = sidebar(famId);
  const s = scoreAssessment(state).byFamily[famId];
  const fs = document.querySelector(".fam-score");
  if (fs) fs.innerHTML = `${progressRing(s.score, "Family compliance")}<span class="muted small">${s.assessed}/${s.inScope} assessed</span>`;
}

// ------------------------------------------------------------------ events

app.addEventListener("toggle", (e) => {
  const d = e.target;
  if (d.matches?.("details.ctl") && d.open) {
    const body = d.querySelector(".ctl-body");
    if (!body.innerHTML.trim()) body.innerHTML = controlBody(CONTROL_MAP[d.dataset.id]);
  }
}, true);

app.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.profile && ["text", "textarea"].includes(t.type)) {
    state.profile[t.dataset.profile] = t.value;
    save();
  } else if (t.dataset.field && t.tagName === "TEXTAREA") {
    setAnswer(t.dataset.id, { [t.dataset.field]: t.value });
  } else if (t.id === "review-text") {
    state.review.text = t.value;
    save();
  } else if (t.id === "lib-q") {
    libQuery = t.value;
    const pos = t.selectionStart;
    route();
    const q = document.getElementById("lib-q");
    q.focus();
    q.setSelectionRange(pos, pos);
  }
});

app.addEventListener("change", async (e) => {
  const t = e.target;
  if (t.dataset.profile && t.type === "radio") {
    state.profile[t.dataset.profile] = t.value;
    save();
    document.getElementById("scope-summary").innerHTML = scopeSummary();
  } else if (t.dataset.q !== undefined && t.dataset.id) {
    const a = getAnswer(state, t.dataset.id);
    const q = [...a.q];
    q[Number(t.dataset.q)] = t.value;
    setAnswer(t.dataset.id, { q });
    refreshControl(t.dataset.id);
  } else if (t.dataset.field && (t.tagName === "SELECT" || t.type === "date")) {
    setAnswer(t.dataset.id, { [t.dataset.field]: t.value });
    refreshControl(t.dataset.id, t.dataset.field === "applicability");
  } else if (t.id === "lib-cls") {
    libCls = t.value;
    route();
  } else if (t.dataset.action === "import-json" && t.files[0]) {
    try {
      const data = JSON.parse(await t.files[0].text());
      if (!data.profile || !data.answers) throw new Error("Not an assessment file");
      state = migrate(data);
      save();
      toast("Assessment imported");
      route();
    } catch (err) {
      toast(`Import failed: ${err.message}`);
    }
  } else if (t.dataset.action === "load-text" && t.files[0]) {
    let text = await t.files[0].text();
    if (/\.html?$/i.test(t.files[0].name)) text = new DOMParser().parseFromString(text, "text/html").body.textContent ?? "";
    state.review.text = text;
    save();
    route();
    toast(`Loaded ${t.files[0].name}`);
  }
});

app.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-tab]");
  if (tab) {
    const g = tab.closest(".gemba");
    g.querySelectorAll("[data-tab]").forEach((b) => { b.classList.toggle("on", b === tab); b.setAttribute("aria-selected", b === tab); });
    g.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    return;
  }
  const el = e.target.closest("[data-action]");
  if (!el || el.tagName === "INPUT") return;
  const action = el.dataset.action;
  const actions = {
    "export-json": () => download(`itsg33-${slug()}.json`, JSON.stringify(state, null, 2), "application/json"),
    "export-md": () => download(`itsg33-report-${slug()}.md`, reportToMarkdown(buildReportModel(state)), "text/markdown"),
    "export-csv": () => download(`itsg33-controls-${slug()}.csv`, reportToCSV(buildReportModel(state)), "text/csv"),
    print: () => window.print(),
    reset: () => {
      if (!confirm("Delete this assessment from this browser? Export it first if you want to keep it.")) return;
      state = newState();
      save();
      route();
      toast("Started a new assessment");
    },
    "load-sample": () => {
      if (Object.keys(state.answers).length && !confirm("Replace the current assessment with the sample?")) return;
      state = sampleState();
      save();
      toast("Sample product loaded");
      location.hash = "#/review";
      route();
    },
    "sample-text": () => {
      state.review.text = SAMPLE_TEXT;
      save();
      route();
    },
    analyze: () => {
      const text = document.getElementById("review-text").value;
      if (!text.trim()) { toast("Paste some documentation text first"); return; }
      state.review = { text, results: analyzeText(text), analyzedAt: new Date().toISOString() };
      save();
      route();
      toast(`Found evidence for ${state.review.results.covered} controls`);
    },
    "clear-review": () => {
      state.review.results = null;
      save();
      route();
    },
    "apply-hint": () => {
      state.profile[el.dataset.field] = el.dataset.value;
      save();
      route();
      toast("Scope updated");
    },
    "copy-evidence": () => {
      let n = 0;
      for (const [id, m] of Object.entries(state.review.results.controls)) {
        const a = getAnswer(state, id);
        const lines = [...m.evidence, ...m.caveats.map((s) => `(caveat) ${s}`)];
        const block = `[Document review] ${lines.join(" | ")}`;
        if (a.notes.includes("[Document review]")) continue;
        setAnswer(id, { notes: a.notes ? `${a.notes}\n${block}` : block });
        n++;
      }
      toast(`Copied evidence into ${n} controls' notes`);
    },
    draft: () => {
      const id = el.dataset.id;
      const ta = document.querySelector(`textarea[data-field="statement"][data-id="${id}"]`);
      if (ta.value.trim() && !confirm("Replace the current statement with a generated draft?")) return;
      ta.value = draftStatement(CONTROL_MAP[id], state);
      setAnswer(id, { statement: ta.value });
    },
    "expand-all": () => document.querySelectorAll("details.ctl").forEach((d) => { d.open = true; }),
    "collapse-all": () => document.querySelectorAll("details.ctl").forEach((d) => { d.open = false; }),
  };
  actions[action]?.();
});

// ------------------------------------------------------------------ theme

const themeBtn = document.getElementById("theme-toggle");
function applyTheme(t) {
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
try { applyTheme(localStorage.getItem("itsg33-theme")); } catch { /* ignore */ }
themeBtn.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  const t = dark ? "light" : "dark";
  applyTheme(t);
  try { localStorage.setItem("itsg33-theme", t); } catch { /* ignore */ }
});

// ------------------------------------------------------------------ sample

const SAMPLE_TEXT = `CaseTrack Online is a software as a service case management product hosted in Microsoft Azure Canada Central with backups replicated to Canada East.
Users sign in with SAML single sign-on through the customer's Entra ID tenant, and MFA is enforced by the customer's conditional access policies.
Role-based access control is enforced server-side on every API request.
All data is encrypted at rest with AES-256 using Azure Key Vault customer-managed keys, and all traffic uses TLS 1.2 or higher.
Audit logs capture sign-ins, record views and exports and are forwarded to the customer's SIEM.
Log retention is 90 days by default.
Databases are reachable only through private endpoints; the only public interface is an Azure Application Gateway with WAF.
Vulnerability scanning with Trivy and Snyk runs on every build, and a third-party penetration test is performed annually.
Dependabot pull requests keep dependencies patched; critical vulnerabilities are patched within 7 days.
Uploaded attachments are scanned for malware before they become available.
Remote support access by our engineers requires customer approval through a just-in-time support access workflow.
Incident response follows our documented plan, and customers are notified of security incidents within 24 hours.
Disaster recovery testing is planned for next year; point-in-time restore backups are kept for 35 days.
Our staff hold Reliability Status; subcontractor screening is available upon request.
Infrastructure is defined in Terraform and all changes go through pull request review and the CI/CD pipeline.
A SOC 2 Type II report is available under NDA.
A mobile app for iOS and Android is not yet available.`;

function sampleState() {
  const s = newState();
  s.profile = {
    ...s.profile,
    productName: "CaseTrack Online",
    org: "CaseTrack Software Inc.",
    description: "Cloud case management for departmental program officers handling Protected B client files.",
  };
  s.review.text = SAMPLE_TEXT;
  return s;
}

// ------------------------------------------------------------------ start

window.addEventListener("hashchange", route);
route();
