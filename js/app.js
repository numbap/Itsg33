// UI layer: hash routing, rendering and event handling. All data stays in the
// browser: encrypted, in memory only, or (Unclassified only) unencrypted in
// localStorage. See js/storage.js and policies/protected-b.md.

// Refuse to run inside a frame. Any page on the same origin (on github.io, every
// project site of the same account) could otherwise read the decrypted assessment
// out of a framed copy. Content Security Policy frame-ancestors cannot be set from
// a <meta> tag, so this check is the available defence on static hosting.
if (window.top !== window.self) {
  document.body.textContent = "For security, the ITSG-33 Compliance Navigator cannot be used inside a frame. Open it directly in a browser tab.";
  throw new Error("Refusing to run inside a frame");
}

import {
  ANSWER_OPTIONS, APPLICABILITY, CONTROLS, CONTROL_MAP, FAMILIES, FAMILY_MAP, OVERRIDE_OPTIONS, STATUS,
  analyzeText, controlsByFamily, draftStatement, evaluateControl, fillTemplate, getAnswer, newState,
  scoreAssessment, STATE_VERSION,
} from "./engine.js";
import { CLASSES } from "./data/families.js";
import { PROFILE_FIELDS, PROFILE_DEFAULTS, PROFILE_LABELS, profileWarnings } from "./data/scoping.js";
import { KINDS, PHASES, PHASE_MAP, PROCESS_MAP, PROCESS_NODES, PROCESS_START, nextIds } from "./data/process.js";
import { buildReportModel, esc, reportToCSV, reportToHTML, reportToMarkdown } from "./report.js";
import { SAMPLE_TEXT, sampleState } from "./sample.js";
import { KEYS, LOCK_OPTIONS, MARKINGS, MODES, PolicyError, Store, modeAllowed } from "./storage.js";
import { MIN_PASSPHRASE } from "./vault.js";

const app = document.getElementById("app");

// ------------------------------------------------------------------ state

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

let browserStorage = null;
try { browserStorage = window.localStorage; } catch { /* blocked: memory mode only */ }
const store = new Store(browserStorage ?? { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() {} });

// null while the setup or lock screen is showing.
let state = store.status() === "ready" ? migrate(store.loadReady() ?? newState()) : null;
let saveTimer;

function save() {
  if (!state) return;
  state.updatedAt = new Date().toISOString();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => store.save(state), 250);
}

const marking = () => MARKINGS[store.settings?.marking] ?? null;
const isProtected = () => !!marking()?.protected;

function setAnswer(id, patch) {
  state.answers[id] = { ...getAnswer(state, id), ...patch };
  save();
}

// ------------------------------------------------------------------ helpers

// Screen reader announcement through the polite live region (WCAG 4.1.3).
let liveTimer;
function announce(msg) {
  const live = document.getElementById("live");
  live.textContent = "";
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { live.textContent = msg; }, 60);
}

// Visible confirmation that stays until dismissed (no time limit, WCAG 2.2.1);
// the same text is announced through the live region.
function toast(msg) {
  announce(msg);
  document.getElementById("toast-msg").textContent = msg;
  document.getElementById("toast").hidden = false;
}

function hideToast() {
  document.getElementById("toast").hidden = true;
}

document.getElementById("toast-close").addEventListener("click", hideToast);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideToast(); });

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = () => {
  const base = (state.profile.productName || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
  return marking() ? `${base}-${marking().banner.replace(/ /g, "-")}` : base;
};

// Plain-text exports cannot be encrypted (Markdown, CSV); for protected
// assessments the user confirms they will store the file appropriately.
function confirmPlainExport() {
  if (!isProtected()) return true;
  return confirm(`This file will not be encrypted. It contains ${marking().label} information: mark it, and store or send it only on systems approved for ${marking().label}. Continue?`);
}
const pct = (x) => `${Math.round(x * 100)}%`;
const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

function pills(r) {
  return `<span class="pill app-${r.applicability.status}" title="${esc(APPLICABILITY[r.applicability.status].help)}">${APPLICABILITY[r.applicability.status].label}</span>
    <span class="pill st-${r.status}">${STATUS[r.status].label}</span>`;
}

function progressRing(value, label) {
  const deg = Math.round(value * 360);
  return `<div class="ring" data-deg="${deg}" role="img" aria-label="${label} ${pct(value)}"><span>${pct(value)}</span></div>`;
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
        <a class="btn" href="#/process">Explore the assessment process</a>
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
    <p>Marked <strong>${esc(marking().label)}</strong> · ${esc(MODES[store.settings.mode].label)}. Nothing is sent to any server.</p>
    <div class="actions">
      <a class="btn" href="#/security">Data and security: export, import, passphrase</a>
      <button class="btn" data-action="load-sample">Load sample product</button>
      <button class="btn danger" data-action="reset">Start a new assessment</button>
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
    <p class="lead">Answer what you know. Each answer changes which ITSG-33 controls apply. The “What this scope means” summary shows the effect as you go.</p></div>
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
          <button class="btn small" data-action="apply-hint" data-field="${h.field}" data-value="${h.value}" aria-label="Apply: ${esc(fieldLabel[h.field])}">Apply</button></li>`).join("")}</ul>` : ""}
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
      <label class="btn file-btn">Load text file<input type="file" class="sr-only" accept=".txt,.md,.markdown,.csv,.json,.html,.htm,text/*" data-action="load-text"></label>
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
  const id = (part, k) => `${c.id}-${part}-${k}`;
  return `<div class="gemba" data-gemba="${c.id}">
    <div class="tabs" role="tablist" aria-label="Gemba walk for ${c.id}">${tabs.map(([k, label], i) => `<button type="button" role="tab" class="tab ${i === 0 ? "on" : ""}" id="${id("tab", k)}" aria-controls="${id("panel", k)}" data-tab="${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join("")}</div>
    ${tabs.map(([k, , body], i) => `<div class="tab-panel" role="tabpanel" id="${id("panel", k)}" aria-labelledby="${id("tab", k)}" tabindex="0" data-panel="${k}" ${i === 0 ? "" : "hidden"}>${body}</div>`).join("")}
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
      <h2 class="h5">Questions<span class="sr-only"> for ${c.id}</span></h2>
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

function libraryItems(query, cls) {
  const q = query.toLowerCase();
  return CONTROLS.filter((c) => (!cls || FAMILY_MAP[c.family].cls === cls) &&
    (!q || [c.id, c.title, c.summary, ...c.eliminate, ...c.keywords].join(" ").toLowerCase().includes(q)));
}

function libraryResults(items) {
  return items.map((c) => {
    const r = evaluateControl(c, state);
    return `<a class="card lib-item" href="#/control/${c.id}">
      <div class="lib-top"><span class="cid">${c.id}</span><span class="sev sev-${c.sev}">${c.sev}</span>${pills(r)}</div>
      <h2 class="h5">${esc(c.title)}</h2><p class="small muted">${esc(c.summary)}</p>
      <p class="small"><strong>Eliminate:</strong> ${esc(c.eliminate[0])}</p></a>`;
  }).join("") || `<p>No controls match.</p>`;
}

function updateLibrary() {
  const items = libraryItems(libQuery, libCls);
  document.getElementById("lib-results").innerHTML = libraryResults(items);
  document.getElementById("lib-count").textContent = `${items.length} controls`;
  clearTimeout(updateLibrary.t);
  updateLibrary.t = setTimeout(() => announce(`${items.length} controls found`), 400);
}

function viewLibrary(query = "", cls = "") {
  const items = libraryItems(query, cls);
  return `
  <div class="page-head"><h1>Gemba library</h1>
    <p class="lead">Every control with its Gemba walk: go and see, eliminate by design, consequences, mitigations and how to describe it.</p></div>
  <div class="filters card">
    <label class="sr-only" for="lib-q">Search controls</label><input type="search" id="lib-q" placeholder="Search controls, e.g. MFA, backup, data residency" value="${esc(query)}">
    <select id="lib-cls" aria-label="Filter by class"><option value="">All classes</option>${Object.entries(CLASSES).map(([k, v]) => `<option value="${k}" ${cls === k ? "selected" : ""}>${v}</option>`).join("")}</select>
    <span class="muted small" id="lib-count">${items.length} controls</span>
  </div>
  <div class="lib-grid" id="lib-results">${libraryResults(items)}</div>`;
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

// ------------------------------------------------------------------ assessment process

// The path taken through the decision tree in this tab: [{ id, choice }].
// Kept in memory only; it contains no assessment data.
let procPath = [];
let procPending = null;

function trackPath(id) {
  const p = procPending;
  procPending = null;
  if (p?.jump !== undefined) procPath = procPath.slice(0, p.jump + 1);
  else if (!p && procPath.at(-2)?.id === id) { procPath.pop(); return; } // browser Back
  const last = procPath.at(-1);
  if (last?.id === id) return; // re-render of the same step
  if (last && p?.from === last.id) last.choice = p.choice;
  procPath.push({ id });
  if (procPath.length > 100) procPath = procPath.slice(-100);
}

const procList = (items, tag = "ul") => `<${tag}>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</${tag}>`;
const kindBadge = (n) => `<span class="kind kind-${n.kind}"><span aria-hidden="true">${KINDS[n.kind].icon}</span> ${KINDS[n.kind].label}</span>`;

function procDetails(n) {
  const block = (title, body, cls = "") => `<section class="proc-sec ${cls}"><h3 class="h5">${title}</h3>${body}</section>`;
  const parts = [];
  if (n.who?.length) parts.push(block("Who", procList(n.who)));
  if (n.inputs?.length) parts.push(block("Inputs", procList(n.inputs)));
  if (n.tasks?.length) parts.push(block(n.kind === "outcome" ? "What to do" : "Tasks", procList(n.tasks, "ol"), "wide"));
  if (n.outputs?.length) parts.push(block("Outputs and artefacts", procList(n.outputs)));
  if (n.evidence?.length) parts.push(block("Evidence", procList(n.evidence)));
  if (n.pitfalls?.length) parts.push(block("Watch out", procList(n.pitfalls), "warn"));
  if (n.controls?.length) parts.push(block("Related controls", `<ul class="proc-ctls">${n.controls.map((id) => `<li><a href="#/control/${id}"><span class="cid">${id}</span> ${esc(CONTROL_MAP[id]?.title ?? "")}</a></li>`).join("")}</ul>`));
  if (n.refs?.length) parts.push(block("References", procList(n.refs)));
  return parts.length ? `<div class="proc-grid">${parts.join("")}</div>` : "";
}

function procMap(currentId) {
  const visited = new Set(procPath.map((p) => p.id));
  return PHASES.map((ph) => {
    const nodes = PROCESS_NODES.filter((n) => n.phase === ph.id);
    return `<section class="proc-map-phase"><h3 class="h5">${esc(ph.name)} <span class="muted small">${esc(ph.ref)}</span></h3>
      <ul class="proc-map-list">${nodes.map((n) => {
        const edges = n.kind === "question"
          ? `<ul class="proc-edges">${n.options.map((o) => `<li>${esc(o.label)} → <a href="#/process/${o.next}">${esc(PROCESS_MAP[o.next].title)}</a></li>`).join("")}</ul>`
          : n.next ? `<p class="proc-edges">Then → <a href="#/process/${n.next}">${esc(PROCESS_MAP[n.next].title)}</a></p>` : "";
        const state = n.id === currentId ? " is-current" : visited.has(n.id) ? " is-visited" : "";
        return `<li class="proc-map-item${state}"><a class="proc-chip kind-${n.kind}" href="#/process/${n.id}" ${n.id === currentId ? 'aria-current="location"' : ""}><span aria-hidden="true">${KINDS[n.kind].icon}</span> ${esc(n.title)}<span class="sr-only">, ${KINDS[n.kind].label.toLowerCase()}${state === " is-visited" ? ", visited" : ""}</span></a>${edges}</li>`;
      }).join("")}</ul></section>`;
  }).join("");
}

function viewProcess(id) {
  const n = PROCESS_MAP[id || PROCESS_START];
  if (!n) return `<div class="page-head"><h1>Assessment process</h1></div><p>Unknown step ${esc(id)}. <a href="#/process">Start the decision tree</a></p>`;
  if (!id) procPath = []; // the tree's entry point always starts a new path
  trackPath(n.id);
  const phase = PHASE_MAP[n.phase];
  const phaseIndex = PHASES.indexOf(phase);
  const prev = procPath.at(-2);
  const total = PROCESS_NODES.length;
  const questions = PROCESS_NODES.filter((x) => x.kind === "question").length;

  let body = "";
  if (n.kind === "question") {
    body = `<h3 class="h5" id="proc-choose">Choose an answer</h3>
      <ul class="proc-options" aria-labelledby="proc-choose">${n.options.map((o, i) => `<li><a class="proc-opt" href="#/process/${o.next}" data-from="${n.id}" data-choice="${i}">
        <strong>${esc(o.label)}</strong><span>${esc(o.help)}</span><span class="proc-to"><span aria-hidden="true">→</span> ${esc(PROCESS_MAP[o.next].title)}</span></a></li>`).join("")}</ul>`;
  }
  const actions = [];
  if (n.next) actions.push(`<a class="btn primary" href="#/process/${n.next}" data-from="${n.id}">Continue: ${esc(PROCESS_MAP[n.next].title)} <span aria-hidden="true">→</span></a>`);
  if (n.app) actions.push(`<a class="btn" href="${n.app.href}">${esc(n.app.label)}</a>`);
  if (prev) actions.push(`<a class="btn" href="#/process/${prev.id}" data-path="${procPath.length - 2}"><span aria-hidden="true">←</span> Back<span class="sr-only">: ${esc(PROCESS_MAP[prev.id].title)}</span></a>`);
  if (n.kind === "outcome") actions.push(`<a class="btn primary" href="#/process" data-path="-1">Start again</a>`);

  return `
  <div class="page-head">
    <h1>ITSG-33 assessment process</h1>
    <p class="lead">An interactive decision tree of the ITSG-33 security risk management and assessment process, from defining security needs to authorization, monitoring and disposal. Answer each decision to follow your path; every activity lists who is involved, inputs, tasks, outputs, related controls and references.</p>
  </div>
  <nav class="proc-phases" aria-label="Process phases"><ol>${PHASES.map((p, i) => {
    const first = PROCESS_NODES.find((x) => x.phase === p.id);
    const cls = i === phaseIndex ? "is-current" : "";
    return `<li><a class="${cls}" href="#/process/${first.id}" ${i === phaseIndex ? 'aria-current="step"' : ""}>${esc(p.name)}</a></li>`;
  }).join("")}</ol></nav>
  <div class="proc">
    <section class="card proc-node kind-${n.kind}" id="proc-node" aria-labelledby="proc-title">
      <p class="eyebrow">${esc(phase.name)} · ${esc(phase.ref)}</p>
      <p class="proc-kind">${kindBadge(n)}</p>
      <h2 id="proc-title" tabindex="-1">${esc(n.title)}</h2>
      <p class="proc-summary">${esc(n.summary)}</p>
      ${body}
      ${procDetails(n)}
      ${actions.length ? `<div class="actions">${actions.join("")}</div>` : ""}
    </section>
    <aside class="card proc-path" aria-labelledby="proc-path-h">
      <h2 class="h5" id="proc-path-h">Your path</h2>
      <ol class="proc-trail">${procPath.map((p, i) => {
        const pn = PROCESS_MAP[p.id];
        const choice = p.choice !== undefined && pn.kind === "question" ? `<span class="proc-choice">${esc(pn.options[p.choice]?.label ?? "")}</span>` : "";
        return i === procPath.length - 1
          ? `<li aria-current="step"><strong>${esc(pn.title)}</strong></li>`
          : `<li><a href="#/process/${p.id}" data-path="${i}">${esc(pn.title)}</a>${choice}</li>`;
      }).join("")}</ol>
      ${procPath.length > 1 ? `<a class="btn small" href="#/process" data-path="-1">Start over</a>` : `<p class="muted small">Your answers appear here as you go. Nothing is saved.</p>`}
    </aside>
  </div>
  <section class="card proc-map-wrap">
    <h2 class="h4">The whole decision tree</h2>
    <p class="muted small">${total} steps across ${PHASES.length} phases, with ${questions} decisions. <span aria-hidden="true">${KINDS.question.icon}</span> decision, <span aria-hidden="true">${KINDS.step.icon}</span> activity, <span aria-hidden="true">${KINDS.outcome.icon}</span> end point. Select any step to jump to it.</p>
    <details class="proc-map"><summary>Show every step and where it leads</summary>${procMap(n.id)}</details>
  </section>
  <p class="small muted">Paraphrased from ITSG-33 Annexes 1 and 2 and related Government of Canada guidance. Your department's security assessment and authorization process takes precedence; check the official CCCS publications for authoritative wording.</p>`;
}

function viewReport() {
  const m = buildReportModel(state, { marking: marking()?.banner });
  return `
  <div class="page-head no-print"><h1>4. Compliance report</h1>
    <p class="lead">Generated from your scope, document review and questionnaire answers. Update answers at any time and the report updates.</p>
    <div class="actions">
      <button class="btn primary" data-action="print">Print / save as PDF</button>
      <button class="btn" data-action="export-md">Download Markdown</button>
      <button class="btn" data-action="export-csv">Download CSV (control list)</button>
    </div>
    ${isProtected() ? `<p class="small">Downloads and printouts are not encrypted. Mark them and keep them only on systems approved for ${esc(marking().label)}.</p>` : ""}</div>
  <div class="card">${reportToHTML(m)}</div>`;
}

// ------------------------------------------------------------------ data protection views

const radios = (name, options, checked, extra = () => "") => `<div class="choices stacked">${options.map(([value, label, hint]) => `
  <label class="choice"><input type="radio" name="${name}" value="${value}" ${value === checked ? "checked" : ""} ${extra(value)}><span>${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ""}</span></label>`).join("")}</div>`;

const MARKING_OPTIONS = [
  ["pb", "Protected B", "Typical for an assessment of a Protected B system: it describes the system's weaknesses."],
  ["pa", "Protected A", ""],
  ["unclassified", "Unclassified", ""],
];
const MODE_OPTIONS = [
  ["encrypted", MODES.encrypted.label, "Recommended. Saved on this device with AES-256 encryption under your passphrase; locks after inactivity."],
  ["memory", MODES.memory.label, "Nothing is written to this device. Export an encrypted file before closing the tab."],
  ["plain", MODES.plain.label, "Readable by anyone with access to this browser profile. Not allowed for Protected information."],
];

function passFields(prefix, { legend = "Passphrase", current = false, confirmField = true, hidden = false } = {}) {
  const auto = current ? "current-password" : "new-password";
  return `<fieldset class="pass-fields" id="${prefix}-fields" ${hidden ? "hidden" : ""}><legend>${legend}</legend>
    ${current ? "" : `<p class="why" id="${prefix}-hint">At least ${MIN_PASSPHRASE} characters; four or more unrelated words work well. It cannot be recovered if forgotten, so store it in your password manager.</p>`}
    <div class="field"><label class="field-label" for="${prefix}">Passphrase</label>
      <input type="password" id="${prefix}" name="${prefix}" autocomplete="${auto}" spellcheck="false" ${current ? "" : `aria-describedby="${prefix}-hint"`}></div>
    ${confirmField ? `<div class="field"><label class="field-label" for="${prefix}-2">Confirm passphrase</label>
      <input type="password" id="${prefix}-2" name="${prefix}-2" autocomplete="${auto}" spellcheck="false"></div>` : ""}
    <label class="check"><input type="checkbox" data-action="show-pass" data-target="${prefix}"> Show passphrase</label>
  </fieldset>`;
}

function viewSetup() {
  const legacy = store.hasLegacyPlain();
  return `
  <div class="page-head"><h1>Choose how this browser keeps your work</h1>
    <p class="lead">This application runs entirely in your browser. Nothing you enter is sent to any server. Decide how the assessment is kept on this device.</p></div>
  ${legacy ? `<p class="callout warn">An unencrypted assessment from an earlier version was found in this browser. Your choice below will protect it: it is encrypted, kept only in this tab, or left unencrypted (Unclassified only).</p>` : ""}
  ${store.available ? "" : `<p class="callout warn">This browser does not allow websites to store data (for example, a private window), so only “Not saved” is available.</p>`}
  <form id="setup-form" class="card narrow" novalidate>
    <div class="form-errors"></div>
    <fieldset id="marking-field"><legend>Security marking of this assessment</legend>${radios("marking", MARKING_OPTIONS, "pb")}</fieldset>
    <fieldset id="mode-field"><legend>How to keep your work</legend>${radios("mode", MODE_OPTIONS, store.available ? "encrypted" : "memory")}</fieldset>
    ${passFields("setup-pass", { hidden: !store.available })}
    <button class="btn primary" type="submit">Continue</button>
  </form>
  <p class="narrow small">Read the <a href="policies/privacy.html">privacy policy</a> and <a href="policies/protected-b.html">how this tool handles Protected B</a>.</p>`;
}

function viewLock() {
  return `
  <div class="page-head"><h1>Assessment locked</h1>
    <p class="lead">Your assessment is encrypted in this browser. Enter your passphrase to continue.</p></div>
  <form id="unlock-form" class="card narrow" novalidate>
    <div class="form-errors"></div>
    ${passFields("unlock-pass", { legend: "Unlock", current: true, confirmField: false })}
    <button class="btn primary" type="submit">Unlock</button>
  </form>
  <section class="card narrow" aria-labelledby="forgot-h"><h2 class="h5" id="forgot-h">Forgotten passphrase?</h2>
    <p>The passphrase cannot be recovered and the data cannot be decrypted without it. You can erase the encrypted assessment and start again.</p>
    <button type="button" class="btn danger" data-action="erase-all">Erase all data and start over</button></section>`;
}

function viewSecurity() {
  const st = store.settings;
  const enc = st.mode === "encrypted";
  return `
  <div class="page-head"><h1>Data and security</h1>
    <p class="lead">Everything stays on this device. Nothing is sent to a server, and the Content Security Policy blocks the page from making network connections.</p></div>
  <section class="card" aria-labelledby="sec-status"><h2 class="h4" id="sec-status">Current settings</h2>
    <dl class="kv-list">
      <div><dt>Security marking</dt><dd>${esc(marking().label)}</dd></div>
      <div><dt>Storage</dt><dd>${esc(MODES[st.mode].label)}</dd></div>
      <div><dt>Auto-lock</dt><dd>${enc ? (st.lockMinutes ? `After ${st.lockMinutes} minutes of inactivity` : "Off") : "Not applicable (not encrypted)"}</dd></div>
    </dl>
    <p class="small">See the <a href="policies/privacy.html">privacy policy</a> and <a href="policies/protected-b.html">Protected B handling and caveats</a>.</p></section>

  <form id="marking-form" class="card" novalidate><h2 class="h4">Security marking</h2><div class="form-errors"></div>
    <fieldset id="marking-field"><legend>Marking shown on every screen, report and export</legend>${radios("marking", MARKING_OPTIONS, st.marking)}</fieldset>
    <button class="btn" type="submit">Save marking</button></form>

  <form id="mode-form" class="card" novalidate><h2 class="h4">Storage</h2><div class="form-errors"></div>
    <fieldset id="mode-field"><legend>How to keep your work</legend>${radios("mode", MODE_OPTIONS, st.mode)}</fieldset>
    ${passFields("mode-pass", { legend: "Passphrase for encrypted storage", hidden: true })}
    <p class="small muted">Changing storage rewrites or removes the copy in this browser. Choosing “Not saved” deletes the stored copy now.</p>
    <button class="btn" type="submit">Change storage</button></form>

  ${enc ? `<form id="pass-form" class="card" novalidate><h2 class="h4">Change passphrase</h2><div class="form-errors"></div>
    ${passFields("new-pass", { legend: "New passphrase" })}
    <button class="btn" type="submit">Change passphrase</button></form>

  <form id="lock-form" class="card" novalidate><h2 class="h4">Auto-lock</h2><div class="form-errors"></div>
    <div class="field"><label class="field-label" for="lock-min">Lock after this much inactivity</label>
    <select id="lock-min" name="lock-min">${LOCK_OPTIONS.map((m) => `<option value="${m}" ${m === st.lockMinutes ? "selected" : ""}>${m ? (m >= 60 ? `${m / 60} hour${m > 60 ? "s" : ""}` : `${m} minutes`) : "Never"}</option>`).join("")}</select></div>
    <p class="why">Locking clears the decrypted assessment from the page. Nothing is lost; unlock with your passphrase.</p>
    <button class="btn" type="submit">Save auto-lock</button></form>` : ""}

  <form id="export-form" class="card" novalidate><h2 class="h4">Export</h2><div class="form-errors"></div>
    <p>Encrypted files can be moved to another computer or shared through approved channels. Use a different passphrase from your browser passphrase and send it separately.</p>
    ${passFields("export-pass", { legend: "Passphrase for the exported file" })}
    <div class="actions"><button class="btn primary" type="submit">Download encrypted file</button>
    <button type="button" class="btn" data-action="export-json">Download unencrypted file</button></div></form>

  <form id="import-form" class="card" novalidate><h2 class="h4">Import</h2><div class="form-errors"></div>
    <div class="field"><label class="field-label" for="import-file">Assessment file (encrypted or unencrypted)</label>
      <input type="file" id="import-file" name="import-file" accept="application/json,.json"></div>
    <div class="field"><label class="field-label" for="import-pass">Passphrase (encrypted files only)</label>
      <input type="password" id="import-pass" name="import-pass" autocomplete="off" spellcheck="false"></div>
    <p class="small muted">Importing replaces the current assessment.</p>
    <button class="btn" type="submit">Import</button></form>

  <section class="card" aria-labelledby="erase-h"><h2 class="h4" id="erase-h">Erase</h2>
    <p>Remove the assessment, settings and preferences this application has stored in this browser.</p>
    ${enc ? `<div class="actions"><button type="button" class="btn" data-action="lock-now">Lock now</button>` : `<div class="actions">`}
    <button type="button" class="btn danger" data-action="erase-all">Erase all data from this browser</button></div></section>`;
}

// Accessible form errors: a summary that takes focus, linked to each field,
// plus aria-invalid and an inline message on the field itself (WCAG 3.3.1, 3.3.3).
const FIELD_TARGET = {
  marking: "[name=marking]", mode: "[name=mode]", passphrase: "input[type=password]", lock: "#lock-min",
  "export-passphrase": "#export-pass", "import-file": "#import-file", "import-passphrase": "#import-pass",
};

function clearErrors(form) {
  form.querySelector(".form-errors").innerHTML = "";
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  form.querySelectorAll(".field-error").forEach((el) => el.remove());
}

function showError(form, err) {
  clearErrors(form);
  const target = form.querySelector(FIELD_TARGET[err.field] ?? "input, select") ?? form.querySelector("input, select");
  const id = target?.id || `${form.id}-err-target`;
  if (target && !target.id) target.id = id;
  const msgId = `${form.id}-error`;
  if (target) {
    target.setAttribute("aria-invalid", "true");
    const host = target.closest("fieldset") ?? target.closest(".field") ?? target.parentElement;
    host.insertAdjacentHTML("afterbegin", `<p class="field-error" id="${msgId}">${esc(err.message)}</p>`);
    const described = (target.getAttribute("aria-describedby") ?? "").split(" ").filter((x) => x && x !== msgId);
    target.setAttribute("aria-describedby", [msgId, ...described].join(" "));
  }
  const box = form.querySelector(".form-errors");
  box.innerHTML = `<div class="error-summary" role="alert" tabindex="-1"><h2 class="h5">There is a problem</h2>
    <ul><li><a href="#${id}" data-focus="${id}">${esc(err.message)}</a></li></ul></div>`;
  box.firstElementChild.focus();
}

async function busy(form, fn) {
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  form.setAttribute("aria-busy", "true");
  try { await fn(); } catch (e) {
    if (e instanceof PolicyError || e.name === "WrongPassphraseError") showError(form, e instanceof PolicyError ? e : new PolicyError("The passphrase is incorrect.", "passphrase"));
    else showError(form, new PolicyError(e.message || "Something went wrong.", ""));
  } finally {
    if (form.isConnected) { btn.disabled = false; form.removeAttribute("aria-busy"); }
  }
}

const formValue = (form, name) => new FormData(form).get(name) ?? "";

async function onSubmit(form) {
  const v = (n) => formValue(form, n);
  switch (form.id) {
    case "setup-form": return busy(form, async () => {
      const legacy = store.legacyState();
      const initial = migrate(legacy ?? newState());
      await store.setup({ mode: v("mode"), marking: v("marking"), passphrase: v("setup-pass"), confirm: v("setup-pass-2"), state: initial });
      state = initial;
      afterUnlock(`Ready. ${MODES[store.settings.mode].label}.`);
    });
    case "unlock-form": return busy(form, async () => {
      state = migrate(await store.unlock(v("unlock-pass")));
      afterUnlock("Unlocked.");
    });
    case "marking-form": return busy(form, async () => {
      store.setMarking(v("marking"));
      await store.save(state);
      updateChrome(); rerender(); toast(`Marking set to ${marking().label}.`);
    });
    case "mode-form": return busy(form, async () => {
      const mode = v("mode");
      if (mode === store.settings.mode) throw new PolicyError(`Storage is already “${MODES[mode].label}”.`, "mode");
      if (!modeAllowed(mode, store.settings.marking)) throw new PolicyError(`${marking().label} information cannot be stored unencrypted.`, "mode");
      await store.changeMode(mode, { passphrase: v("mode-pass"), confirm: v("mode-pass-2"), state });
      updateChrome(); armAutoLock(); rerender(); toast(`Storage changed: ${MODES[mode].label}.`);
    });
    case "pass-form": return busy(form, async () => {
      await store.changePassphrase(v("new-pass"), v("new-pass-2"), state);
      rerender(); toast("Passphrase changed.");
    });
    case "lock-form": return busy(form, async () => {
      store.setLockMinutes(Number(v("lock-min")));
      armAutoLock(); rerender(); toast("Auto-lock saved.");
    });
    case "export-form": return busy(form, async () => {
      const env = await store.exportEncrypted(state, v("export-pass"), v("export-pass-2"));
      download(`itsg33-${slug()}.encrypted.json`, JSON.stringify(env, null, 2), "application/json");
      form.reset(); toast("Encrypted file downloaded.");
    });
    case "import-form": return busy(form, async () => {
      const file = form.querySelector("#import-file").files[0];
      if (!file) throw new PolicyError("Choose a file to import.", "import-file");
      const r = await store.importFile(await file.text(), v("import-pass"));
      if (r.marking && r.marking !== store.settings.marking) {
        if (!modeAllowed(store.settings.mode, r.marking)) throw new PolicyError(`The file is marked ${MARKINGS[r.marking].label}, which cannot be stored unencrypted. Change storage first.`, "import-file");
        store.setMarking(r.marking);
      }
      state = migrate(r.state);
      save(); updateChrome(); rerender(); toast("Assessment imported.");
    });
  }
}

function afterUnlock(msg) {
  updateChrome();
  armAutoLock();
  if (location.hash && location.hash !== "#/") route();
  else route();
  toast(msg);
}

// Security marking banner and lock button in the header.
function updateChrome() {
  const m = marking();
  const banner = document.getElementById("marking");
  const mode = store.settings ? MODES[store.settings.mode].short : null;
  banner.className = `marking ${m?.protected ? "is-protected" : ""}`;
  banner.innerHTML = `${m ? `<strong>${esc(m.banner)}</strong> ` : ""}<span>${mode ? `${esc(mode)} · ` : ""}Data stays on this device</span>`;
  document.getElementById("lock-btn").hidden = !(state && store.settings?.mode === "encrypted");
}

// Auto-lock after inactivity (encrypted mode only). The delay is user-adjustable,
// including off, and locking loses no work (WCAG 2.2.1).
let lockTimer;
function armAutoLock() {
  clearTimeout(lockTimer);
  const min = store.settings?.lockMinutes;
  if (state && store.settings?.mode === "encrypted" && min) lockTimer = setTimeout(() => lockNow(`Locked after ${min} minutes of inactivity.`), min * 60_000);
}
for (const ev of ["pointerdown", "keydown", "input"]) document.addEventListener(ev, () => { if (state) armAutoLock(); }, { passive: true });

async function lockNow(msg = "Locked.") {
  clearTimeout(saveTimer);
  clearTimeout(lockTimer);
  if (state) await store.save(state);
  store.lock();
  state = null;
  updateChrome();
  route();
  toast(msg);
}

document.getElementById("lock-btn").addEventListener("click", () => lockNow());

// Work kept only in memory is lost on close; ask the browser to confirm.
window.addEventListener("beforeunload", (e) => {
  if (state && store.settings?.mode === "memory" && Object.keys(state.answers).length) e.preventDefault();
});

// Dynamic sizes are applied through the CSSOM because the Content Security Policy
// forbids inline style attributes.
function hydrateStyles() {
  document.querySelectorAll("[data-deg]").forEach((el) => el.style.setProperty("--deg", `${el.dataset.deg}deg`));
  document.querySelectorAll("[data-pct]").forEach((el) => { el.style.width = `${el.dataset.pct}%`; });
}
new MutationObserver(hydrateStyles).observe(document.body, { childList: true, subtree: true });

// ------------------------------------------------------------------ routing

let libQuery = "";
let libCls = "";

// focus: "heading" moves focus to the new page's h1 (in-app navigation),
// "none" leaves it (first load); rerender() restores focus to the same control.
function route({ focus = "heading" } = {}) {
  const [, view = "", a, b] = location.hash.replace(/^#/, "").split("/");
  let nav = { "": "home", profile: "profile", review: "review", assess: "assess", report: "report", library: "library", control: "library", process: "process", security: "security" }[view] ?? "home";
  if (!state) nav = store.status() === "locked" ? "locked" : "setup";
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.toggle("active", el.dataset.nav === nav);
    if (el.dataset.nav === nav) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
  let html;
  if (nav === "locked") html = viewLock();
  else if (nav === "setup") html = viewSetup();
  else switch (view) {
    case "security": html = viewSecurity(); break;
    case "profile": html = viewProfile(); break;
    case "review": html = viewReview(); break;
    case "assess": html = viewAssess(a, b); break;
    case "report": html = viewReport(); break;
    case "library": html = viewLibrary(libQuery, libCls); break;
    case "control": html = viewControl(a); break;
    case "process": html = viewProcess(a); break;
    default: html = viewHome();
  }
  app.innerHTML = html;
  const TITLES = { home: "", setup: "Set up storage", locked: "Locked", security: "Data and security", process: "Assessment process" };
  let t = TITLES[nav] ?? `${nav[0].toUpperCase()}${nav.slice(1)}`;
  if (nav === "process" && a && PROCESS_MAP[a]) t = `${PROCESS_MAP[a].title} · ${t}`;
  document.title = `${t ? `${t} · ` : ""}ITSG-33 Compliance Navigator`;
  const h1 = app.querySelector("h1");
  if (h1) h1.tabIndex = -1;
  if (view === "assess" && b) {
    const card = document.getElementById(`c-${b}`);
    card?.scrollIntoView({ block: "start" });
    if (focus === "heading") card?.querySelector("summary").focus({ preventScroll: true });
  } else if (view === "process" && a && PROCESS_MAP[a]) {
    // Moving through the tree: focus the step's heading, below the phase bar.
    const h2 = document.getElementById("proc-title");
    window.scrollTo(0, 0);
    if (focus === "heading") h2.focus();
  } else {
    window.scrollTo(0, 0);
    if (focus === "heading") h1?.focus({ preventScroll: true });
  }
}

// Re-render the current view after an action, keeping keyboard focus on the
// equivalent control (or the page heading if it no longer exists).
function rerender() {
  const a = document.activeElement;
  const key = a?.id ? `#${CSS.escape(a.id)}` : a?.dataset?.action ? `[data-action="${a.dataset.action}"]` : null;
  route({ focus: "none" });
  const target = (key && app.querySelector(key)) || app.querySelector("h1");
  target?.focus({ preventScroll: !key });
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
    updateLibrary();
  }
});

app.addEventListener("change", async (e) => {
  const t = e.target;
  if (t.dataset.profile && t.type === "radio") {
    state.profile[t.dataset.profile] = t.value;
    save();
    document.getElementById("scope-summary").innerHTML = scopeSummary();
    const n = [...document.querySelectorAll("#scope-summary .sc")].map((e) => e.textContent.trim().replace(/^(\d+)/, "$1 ")).join(", ");
    announce(`Scope updated: ${n}`);
  } else if (t.dataset.q !== undefined && t.dataset.id) {
    const a = getAnswer(state, t.dataset.id);
    const q = [...a.q];
    q[Number(t.dataset.q)] = t.value;
    setAnswer(t.dataset.id, { q });
    refreshControl(t.dataset.id);
    const r = evaluateControl(CONTROL_MAP[t.dataset.id], state);
    announce(`${t.dataset.id}: ${STATUS[r.status].label}`);
  } else if (t.dataset.field && (t.tagName === "SELECT" || t.type === "date")) {
    setAnswer(t.dataset.id, { [t.dataset.field]: t.value });
    refreshControl(t.dataset.id, t.dataset.field === "applicability");
    if (t.tagName === "SELECT") {
      const r = evaluateControl(CONTROL_MAP[t.dataset.id], state);
      announce(`${t.dataset.id}: ${APPLICABILITY[r.applicability.status].label}, ${STATUS[r.status].label}`);
      if (t.dataset.field === "applicability") document.querySelector(`select[data-field="applicability"][data-id="${t.dataset.id}"]`)?.focus();
    }
  } else if (t.id === "lib-cls") {
    libCls = t.value;
    updateLibrary();
  } else if (t.name === "mode" && t.type === "radio") {
    // Passphrase fields are needed only when switching to encrypted storage.
    const fields = t.form.querySelector(".pass-fields");
    if (fields) fields.hidden = !(t.value === "encrypted" && (t.form.id === "setup-form" || store.settings?.mode !== "encrypted"));
  } else if (t.dataset.action === "show-pass") {
    for (const id of [t.dataset.target, `${t.dataset.target}-2`]) {
      const input = document.getElementById(id);
      if (input) input.type = t.checked ? "text" : "password";
    }
  } else if (t.dataset.action === "load-text" && t.files[0]) {
    let text = await t.files[0].text();
    if (/\.html?$/i.test(t.files[0].name)) text = new DOMParser().parseFromString(text, "text/html").body.textContent ?? "";
    state.review.text = text;
    save();
    rerender();
    toast(`Loaded ${t.files[0].name}`);
  }
});

app.addEventListener("submit", (e) => {
  e.preventDefault();
  onSubmit(e.target);
});

function selectTab(tab) {
  const g = tab.closest(".gemba");
  g.querySelectorAll("[data-tab]").forEach((b) => {
    const on = b === tab;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", String(on));
    b.tabIndex = on ? 0 : -1;
  });
  g.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
}

// ARIA tabs keyboard pattern: arrows move between tabs, Home/End jump.
app.addEventListener("keydown", (e) => {
  const tab = e.target.closest?.("[role=tab]");
  if (!tab) return;
  const tabs = [...tab.parentElement.querySelectorAll("[role=tab]")];
  const i = tabs.indexOf(tab);
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  const t = tabs[(next + tabs.length) % tabs.length];
  selectTab(t);
  t.focus();
});

app.addEventListener("click", (e) => {
  const errLink = e.target.closest("[data-focus]");
  if (errLink) {
    e.preventDefault();
    document.getElementById(errLink.dataset.focus)?.focus();
    return;
  }
  const proc = e.target.closest("a[data-from], a[data-path]");
  if (proc) {
    procPending = proc.dataset.path !== undefined
      ? { jump: Number(proc.dataset.path) }
      : { from: proc.dataset.from, choice: proc.dataset.choice !== undefined ? Number(proc.dataset.choice) : undefined };
    return;
  }
  const tab = e.target.closest("[data-tab]");
  if (tab) {
    selectTab(tab);
    return;
  }
  const el = e.target.closest("[data-action]");
  if (!el || el.tagName === "INPUT") return;
  const action = el.dataset.action;
  const actions = {
    "export-json": () => confirmPlainExport() && download(`itsg33-${slug()}.json`, JSON.stringify(state, null, 2), "application/json"),
    "export-md": () => confirmPlainExport() && download(`itsg33-report-${slug()}.md`, reportToMarkdown(buildReportModel(state, { marking: marking()?.banner })), "text/markdown"),
    "export-csv": () => confirmPlainExport() && download(`itsg33-controls-${slug()}.csv`, reportToCSV(buildReportModel(state, { marking: marking()?.banner })), "text/csv"),
    "lock-now": () => lockNow(),
    "erase-all": () => {
      if (!confirm("Erase the assessment, settings and preferences stored by this application in this browser? This cannot be undone.")) return;
      clearTimeout(saveTimer);
      clearTimeout(lockTimer);
      store.eraseAll();
      state = null;
      applyTheme(null);
      updateChrome();
      location.hash = "#/";
      route();
      toast("All data erased from this browser.");
    },
    print: () => window.print(),
    reset: () => {
      if (!confirm("Replace the current assessment with a new, empty one? Export it first if you want to keep it.")) return;
      state = newState();
      save();
      rerender();
      toast("Started a new assessment");
    },
    "load-sample": () => {
      if (Object.keys(state.answers).length && !confirm("Replace the current assessment with the sample?")) return;
      state = sampleState();
      save();
      toast("Sample product loaded");
      if (location.hash === "#/review") rerender();
      else location.hash = "#/review";
    },
    "sample-text": () => {
      state.review.text = SAMPLE_TEXT;
      save();
      rerender();
    },
    analyze: () => {
      const text = document.getElementById("review-text").value;
      if (!text.trim()) { toast("Paste some documentation text first"); return; }
      state.review = { text, results: analyzeText(text), analyzedAt: new Date().toISOString() };
      save();
      rerender();
      toast(`Analysis complete: found evidence for ${state.review.results.covered} controls`);
    },
    "clear-review": () => {
      state.review.results = null;
      save();
      rerender();
    },
    "apply-hint": () => {
      state.profile[el.dataset.field] = el.dataset.value;
      save();
      rerender();
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
  const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  themeBtn.setAttribute("aria-pressed", String(dark));
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

// ------------------------------------------------------------------ start

window.addEventListener("hashchange", () => { hideToast(); route(); });
updateChrome();
armAutoLock();
route({ focus: "none" });
