// Report generation: one model, rendered as HTML (screen/print), Markdown and CSV.

import {
  APPLICABILITY, FAMILIES, STATUS, designLevers, evaluateAll, gapRegister,
  scoreAssessment, statementFor,
} from "./engine.js";
import { PROFILE_FIELDS, profileLabel, profileWarnings } from "./data/scoping.js";

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const pct = (x) => `${Math.round(x * 100)}%`;

export function buildReportModel(state) {
  const results = evaluateAll(state);
  const score = scoreAssessment(state, results);
  const gaps = gapRegister(state, results);
  const profileRows = PROFILE_FIELDS
    .filter((f) => f.id !== "description")
    .map((f) => ({ label: f.label, value: profileLabel(state.profile, f.id) || "—" }));
  const unassessed = results.filter((r) => r.status === "unanswered");
  const openQuestions = results.filter((r) => r.openQuestions.length && !["na", "inherited"].includes(r.status));
  return {
    title: `ITSG-33 Compliance Report: ${state.profile.productName || "Unnamed product"}`,
    generated: new Date().toISOString().slice(0, 10),
    profile: state.profile,
    profileRows,
    warnings: profileWarnings(state.profile),
    score,
    families: FAMILIES.map((f) => ({ ...f, ...score.byFamily[f.id] })),
    levers: designLevers(state, results),
    gaps,
    openQuestions,
    unassessed,
    statements: results.map((r) => ({ ...r, statement: statementFor(r.control, state) })),
    inherited: results.filter((r) => r.applicability.status === "inherited"),
    review: state.review?.results ?? null,
  };
}

function verdict(score, progress) {
  if (progress < 0.5) return "Assessment incomplete. Fewer than half of in-scope controls have been assessed, so the score is not yet meaningful.";
  if (score >= 0.9) return "Strong alignment with the ITSG-33 PBMM profile. Remaining gaps should be tracked in the POA&M before authorization.";
  if (score >= 0.7) return "Substantial alignment, with material gaps. Authorization is plausible with conditions once high-risk gaps have remediation plans.";
  if (score >= 0.5) return "Partial alignment. Significant work remains; high-risk gaps would likely block authorization.";
  return "Low alignment. The product is not ready for authorization at the PBMM level without major remediation or design change.";
}

// ------------------------------------------------------------------ HTML

export function reportToHTML(m) {
  const o = m.score.overall;
  const famRows = m.families.map((f) => `
    <tr>
      <td><strong>${f.id}</strong> ${esc(f.name)}</td>
      <td class="num">${f.inScope}</td>
      <td class="num">${f.counts.implemented + f.counts.inherited}</td>
      <td class="num">${f.counts.partial + f.counts.planned}</td>
      <td class="num">${f.counts["not-implemented"]}</td>
      <td class="num">${f.counts.unknown + f.counts.unanswered}</td>
      <td><div class="bar" role="img" aria-label="${pct(f.score)} compliant"><span style="width:${pct(f.score)}"></span></div> ${pct(f.score)}</td>
    </tr>`).join("");

  const levers = m.levers.length ? m.levers.map((l) => `
    <li><strong>${esc(l.title)}</strong>. ${esc(l.why)}
      <div class="muted small">Affects ${l.controls.join(", ")}${l.gaps.length ? ` · closes or shrinks ${l.gaps.length} current gap(s): ${l.gaps.map((g) => g.control.id).join(", ")}` : ""}</div>
    </li>`).join("") : "<li>No major design levers identified for this profile.</li>";

  const gaps = m.gaps.length ? m.gaps.map((g) => `
    <tr>
      <td><strong>${g.control.id}</strong><br>${esc(g.control.title)}</td>
      <td><span class="pill risk-${g.risk.level.toLowerCase()}">${g.risk.level}</span></td>
      <td>${esc(STATUS[g.status].label)}</td>
      <td><ul>${g.control.consequences.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></td>
      <td>${g.answer.compensating ? `<p><em>In place:</em> ${esc(g.answer.compensating)}</p>` : ""}<ul>${g.control.mitigations.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></td>
      <td>${esc(g.answer.plan || "To be determined")}${g.answer.target ? `<br><span class="muted small">Target: ${esc(g.answer.target)}</span>` : ""}</td>
    </tr>`).join("") : `<tr><td colspan="6">No gaps recorded.</td></tr>`;

  const open = m.openQuestions.length ? `<ul>${m.openQuestions.map((r) => `<li><strong>${r.control.id}</strong> ${esc(r.control.title)}<ul>${r.openQuestions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></li>`).join("")}</ul>` : "<p>No questions were answered “Don't know”.</p>";

  const statements = FAMILIES.map((f) => {
    const items = m.statements.filter((s) => s.control.family === f.id);
    return `<h3>${f.id}: ${esc(f.name)}</h3>${items.map((s) => `
      <div class="stmt">
        <div class="stmt-head"><strong>${s.control.id} ${esc(s.control.title)}</strong>
          <span class="pill app-${s.applicability.status}">${APPLICABILITY[s.applicability.status].label}</span>
          <span class="pill st-${s.status}">${STATUS[s.status].label}</span>
          ${s.statement.draft ? `<span class="pill draft">Draft</span>` : ""}</div>
        <p>${esc(s.statement.text)}</p>
        ${s.answer.notes ? `<p class="small"><em>Evidence / notes:</em> ${esc(s.answer.notes)}</p>` : ""}
      </div>`).join("")}`;
  }).join("");

  const review = m.review ? `
    <h2>Document review coverage</h2>
    <p>The automated review of supplied product documentation found references relevant to <strong>${m.review.covered}</strong> of ${m.score.overall.total} controls across ${m.review.sentenceCount} sentences. Keyword matches are leads for the assessor, not proof of implementation.</p>` : "";

  return `
  <article class="report">
    <header class="report-head">
      <h1>${esc(m.title)}</h1>
      <p class="muted">Responsible organization: ${esc(m.profile.org || "—")} · Generated ${m.generated} · Baseline: ITSG-33 PBMM-oriented control set</p>
    </header>

    <h2>1. Executive summary</h2>
    <div class="kpis">
      <div class="kpi"><div class="kpi-v">${pct(o.score)}</div><div class="kpi-l">Weighted compliance</div></div>
      <div class="kpi"><div class="kpi-v">${pct(o.progress)}</div><div class="kpi-l">Assessment progress</div></div>
      <div class="kpi"><div class="kpi-v">${m.gaps.filter((g) => g.risk.level === "High").length}</div><div class="kpi-l">High-risk gaps</div></div>
      <div class="kpi"><div class="kpi-v">${o.counts.inherited}</div><div class="kpi-l">Inherited controls</div></div>
    </div>
    <p>${esc(verdict(o.score, o.progress))}</p>
    ${m.warnings.length ? `<div class="callout warn"><strong>Scoping warnings</strong><ul>${m.warnings.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}

    <h2>2. System profile</h2>
    ${m.profile.description ? `<p>${esc(m.profile.description)}</p>` : ""}
    <div class="table-wrap" role="region" tabindex="0" aria-label="System profile table"><table class="kv"><caption class="sr-only">System profile</caption>${m.profileRows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join("")}</table></div>

    <h2>3. Compliance by family</h2>
    <div class="table-wrap" role="region" tabindex="0" aria-label="Compliance by control family table"><table class="grid"><caption class="sr-only">Compliance by control family</caption>
      <thead><tr><th scope="col">Family</th><th scope="col">In scope</th><th scope="col">Met</th><th scope="col">Partial</th><th scope="col">Not met</th><th scope="col">Unknown</th><th scope="col">Score</th></tr></thead>
      <tbody>${famRows}</tbody>
    </table></div>

    <h2>4. Design opportunities (eliminate requirements by design)</h2>
    <p>These design choices remove or shrink groups of requirements rather than satisfying them one at a time.</p>
    <ul>${levers}</ul>

    <h2>5. Gap register and plan of action (POA&amp;M)</h2>
    <div class="table-wrap" role="region" tabindex="0" aria-label="Gap register and plan of action table"><table class="grid gaps"><caption class="sr-only">Gap register and plan of action</caption>
      <thead><tr><th scope="col">Control</th><th scope="col">Risk</th><th scope="col">Status</th><th scope="col">Consequences if left unmet</th><th scope="col">Mitigations</th><th scope="col">Planned remediation</th></tr></thead>
      <tbody>${gaps}</tbody>
    </table></div>

    <h2>6. Open questions and unassessed controls</h2>
    ${open}
    ${m.unassessed.length ? `<p><strong>Not yet assessed (${m.unassessed.length}):</strong> ${m.unassessed.map((r) => r.control.id).join(", ")}. These are not counted as gaps above but score zero until assessed.</p>` : ""}

    <h2>7. Inherited controls</h2>
    <p>Evidence for these must come from the providing party (for example the cloud provider's CCCS assessment or a SOC 2 Type II report).</p>
    <ul>${m.inherited.map((r) => `<li><strong>${r.control.id}</strong> ${esc(r.control.title)}: ${esc(r.applicability.reason)}</li>`).join("") || "<li>None.</li>"}</ul>

    ${review}

    <h2>8. Control implementation statements</h2>
    <p class="muted">Statements marked <em>Draft</em> were generated from templates and must be reviewed and adjusted to describe the actual implementation.</p>
    ${statements}

    <h2>Methodology and limitations</h2>
    <p class="small">This report is a self-assessment against a PBMM-oriented subset of the ITSG-33 Annex 3A security controls (base controls, without enhancements), using paraphrased control descriptions. Applicability is derived from the system profile; status is derived from questionnaire answers or assessor overrides. Scores weight implemented and inherited controls as 1, partial as 0.5, planned as 0.25 and all others as 0. It does not replace a formal security assessment and authorization (SA&amp;A) by your departmental IT security team. Consult the official ITSG-33 publications from the Canadian Centre for Cyber Security for authoritative control text.</p>
  </article>`;
}

// ------------------------------------------------------------------ Markdown

const mdCell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ");

export function reportToMarkdown(m) {
  const o = m.score.overall;
  const L = [];
  L.push(`# ${m.title}`, "");
  L.push(`Responsible organization: ${m.profile.org || "—"}  `, `Generated: ${m.generated}  `, "Baseline: ITSG-33 PBMM-oriented control set", "");
  L.push("## 1. Executive summary", "");
  L.push(`- Weighted compliance: **${pct(o.score)}**`, `- Assessment progress: ${pct(o.progress)} of ${o.inScope} in-scope controls`,
    `- High-risk gaps: ${m.gaps.filter((g) => g.risk.level === "High").length}`, `- Inherited controls: ${o.counts.inherited}`, `- Not applicable: ${o.counts.na}`, "");
  L.push(verdict(o.score, o.progress), "");
  if (m.warnings.length) { L.push("**Scoping warnings**", ""); m.warnings.forEach((w) => L.push(`- ${w}`)); L.push(""); }

  L.push("## 2. System profile", "");
  if (m.profile.description) L.push(m.profile.description, "");
  L.push("| Attribute | Value |", "|---|---|");
  m.profileRows.forEach((r) => L.push(`| ${mdCell(r.label)} | ${mdCell(r.value)} |`));
  L.push("");

  L.push("## 3. Compliance by family", "");
  L.push("| Family | In scope | Met | Partial | Not met | Unknown | Score |", "|---|---:|---:|---:|---:|---:|---:|");
  m.families.forEach((f) => L.push(`| ${f.id} ${f.name} | ${f.inScope} | ${f.counts.implemented + f.counts.inherited} | ${f.counts.partial + f.counts.planned} | ${f.counts["not-implemented"]} | ${f.counts.unknown + f.counts.unanswered} | ${pct(f.score)} |`));
  L.push("");

  L.push("## 4. Design opportunities", "");
  if (!m.levers.length) L.push("No major design levers identified for this profile.");
  m.levers.forEach((l) => L.push(`- **${l.title}.** ${l.why} _(Affects ${l.controls.join(", ")}${l.gaps.length ? `; current gaps: ${l.gaps.map((g) => g.control.id).join(", ")}` : ""})_`));
  L.push("");

  L.push("## 5. Gap register and POA&M", "");
  if (!m.gaps.length) L.push("No gaps recorded.");
  m.gaps.forEach((g) => {
    L.push(`### ${g.control.id} ${g.control.title} — ${g.risk.level} risk (${STATUS[g.status].label})`, "");
    L.push("**Consequences if left unmet**", ""); g.control.consequences.forEach((c) => L.push(`- ${c}`)); L.push("");
    if (g.answer.compensating) L.push(`**Compensating measures in place:** ${g.answer.compensating}`, "");
    L.push("**Mitigation options**", ""); g.control.mitigations.forEach((c) => L.push(`- ${c}`)); L.push("");
    L.push(`**Planned remediation:** ${g.answer.plan || "To be determined"}${g.answer.target ? ` (target ${g.answer.target})` : ""}`, "");
  });

  L.push("## 6. Open questions and unassessed controls", "");
  if (!m.openQuestions.length) L.push("No questions were answered “Don't know”.");
  m.openQuestions.forEach((r) => { L.push(`- **${r.control.id} ${r.control.title}**`); r.openQuestions.forEach((q) => L.push(`  - ${q}`)); });
  L.push("");
  if (m.unassessed.length) L.push(`**Not yet assessed (${m.unassessed.length}):** ${m.unassessed.map((r) => r.control.id).join(", ")}. Not counted as gaps, but they score zero until assessed.`, "");

  L.push("## 7. Inherited controls", "");
  m.inherited.forEach((r) => L.push(`- **${r.control.id} ${r.control.title}**: ${r.applicability.reason}`));
  if (!m.inherited.length) L.push("None.");
  L.push("");

  if (m.review) {
    L.push("## Document review coverage", "", `The automated review found references relevant to ${m.review.covered} of ${o.total} controls across ${m.review.sentenceCount} sentences. Keyword matches are leads, not proof.`, "");
  }

  L.push("## 8. Control implementation statements", "", "_Statements marked (draft) were generated from templates and must be reviewed._", "");
  FAMILIES.forEach((f) => {
    L.push(`### ${f.id}: ${f.name}`, "");
    m.statements.filter((s) => s.control.family === f.id).forEach((s) => {
      L.push(`**${s.control.id} ${s.control.title}** — ${APPLICABILITY[s.applicability.status].label} · ${STATUS[s.status].label}${s.statement.draft ? " (draft)" : ""}`, "");
      L.push(s.statement.text, "");
      if (s.answer.notes) L.push(`_Evidence / notes:_ ${s.answer.notes}`, "");
    });
  });

  L.push("## Methodology and limitations", "",
    "Self-assessment against a PBMM-oriented subset of ITSG-33 Annex 3A base controls using paraphrased descriptions. Implemented and inherited controls score 1, partial 0.5, planned 0.25, others 0. This does not replace a formal SA&A. Consult official CCCS ITSG-33 publications for authoritative control text.", "");
  return L.join("\n");
}

// ------------------------------------------------------------------ CSV

const csvCell = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;

export function reportToCSV(m) {
  const header = ["Control", "Title", "Family", "Severity", "Applicability", "Status", "Risk", "Statement", "Evidence/Notes", "Compensating", "Remediation plan", "Target date"];
  const gapRisk = Object.fromEntries(m.gaps.map((g) => [g.control.id, g.risk.level]));
  const rows = m.statements.map((s) => [
    s.control.id, s.control.title, s.control.family, s.control.sev,
    APPLICABILITY[s.applicability.status].label, STATUS[s.status].label, gapRisk[s.control.id] ?? "",
    s.statement.text, s.answer.notes, s.answer.compensating, s.answer.plan, s.answer.target,
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}
