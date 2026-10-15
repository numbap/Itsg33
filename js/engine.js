// Assessment engine. Pure functions only (no DOM) so it runs in the browser
// and under `node --test`.

import { FAMILIES, FAMILY_MAP } from "./data/families.js";
import { TECHNICAL } from "./data/controls-technical.js";
import { OPERATIONAL } from "./data/controls-operational.js";
import { MANAGEMENT } from "./data/controls-management.js";
import { PROFILE_DEFAULTS } from "./data/scoping.js";

// ------------------------------------------------------------------ catalog

// Every family has an "-1" policy and procedures control with the same shape,
// so they are generated rather than written out 17 times.
function policyControl(f) {
  const topic = f.name.toLowerCase();
  return {
    id: `${f.id}-1`, title: `${f.name} Policy and Procedures`, sev: "medium", policy: true,
    summary: `Develop, document, disseminate, and periodically review and update a ${topic} policy and the procedures that implement it.`,
    look: [
      `Ask for the current ${topic} policy and procedures, with approval and last review dates.`,
      "Ask a front-line operator to walk you through the procedure from memory. Does practice match the paper?",
    ],
    eliminate: [
      `Inherit the departmental (or vendor corporate) ${topic} policy and write only a short product-specific procedure that references it.`,
      "Encode procedures in tooling (pipelines, IdP workflows, runbooks) so the document describes what the tools already enforce.",
    ],
    consequences: [
      "Without policy, controls depend on individuals and erode with staff turnover.",
      "Assessors treat missing policy as a gap across the whole family.",
    ],
    mitigations: [
      "Adopt the departmental policy by reference immediately, then fill product-specific procedures.",
    ],
    describe: `{product} follows the {org} ${topic} policy, which is reviewed at least annually. Product-specific procedures implementing the ${f.id} controls are documented and available to the staff who perform them.`,
    questions: [
      `Is there an approved ${topic} policy that applies to this product?`,
      `Are there documented procedures implementing the ${f.id} controls?`,
      "Are the policy and procedures reviewed and updated at a defined frequency?",
    ],
    keywords: [`${topic} policy`, `${f.id.toLowerCase()} policy`, "policy and procedures"],
  };
}

const FAMILY_ORDER = Object.fromEntries(FAMILIES.map((f, i) => [f.id, i]));

function controlSortKey(id) {
  const [fam, num] = id.split("-");
  return FAMILY_ORDER[fam] * 1000 + Number(num);
}

export const CONTROLS = [
  ...FAMILIES.map(policyControl),
  ...TECHNICAL, ...OPERATIONAL, ...MANAGEMENT,
]
  .map((c) => ({ ...c, family: c.id.split("-")[0], scope: c.scope ?? [] }))
  .sort((a, b) => controlSortKey(a.id) - controlSortKey(b.id));

export const CONTROL_MAP = Object.fromEntries(CONTROLS.map((c) => [c.id, c]));

export function controlsByFamily(familyId) {
  return CONTROLS.filter((c) => c.family === familyId);
}

// ------------------------------------------------------------------ state

export const STATE_VERSION = 1;

export function newState() {
  return {
    version: STATE_VERSION,
    profile: { ...PROFILE_DEFAULTS },
    answers: {},
    review: { text: "", results: null, analyzedAt: null },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getAnswer(state, id) {
  return state.answers[id] ?? { q: [], override: "", applicability: "", notes: "", plan: "", target: "", statement: "", compensating: "" };
}

// ------------------------------------------------------------------ applicability

export const APPLICABILITY = {
  applicable: { label: "Applicable", help: "The product must implement and evidence this control." },
  shared: { label: "Shared", help: "Responsibility is split, typically with a provider. The product's portion must be evidenced." },
  inherited: { label: "Inherited", help: "Fully provided by another party (e.g. the cloud provider). Keep their evidence on file." },
  na: { label: "Not applicable", help: "Does not apply given the product's profile." },
};

function matches(when, profile) {
  return Object.entries(when).every(([k, v]) =>
    Array.isArray(v) ? v.includes(profile[k]) : profile[k] === v);
}

// First matching scope rule wins. A user override on the control wins over all.
export function evaluateApplicability(control, profile, answer = {}) {
  if (answer.applicability) {
    return { status: answer.applicability, reason: "Set manually by the assessor.", overridden: true };
  }
  for (const rule of control.scope) {
    if (matches(rule.when, profile)) return { status: rule.status, reason: rule.reason, overridden: false };
  }
  return { status: "applicable", reason: "", overridden: false };
}

// ------------------------------------------------------------------ status

export const ANSWER_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "partial", label: "Partly" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Don't know" },
  { value: "na", label: "N/A" },
];

export const STATUS = {
  implemented: { label: "Implemented", score: 1 },
  inherited: { label: "Inherited", score: 1 },
  partial: { label: "Partially implemented", score: 0.5 },
  planned: { label: "Planned", score: 0.25 },
  "not-implemented": { label: "Not implemented", score: 0 },
  unknown: { label: "Unknown", score: 0 },
  unanswered: { label: "Not assessed", score: 0 },
  na: { label: "Not applicable", score: null },
};

export const OVERRIDE_OPTIONS = ["implemented", "partial", "planned", "not-implemented"];

// Derive a status from the yes/partial/no/unknown answers to a control's questions.
export function deriveStatus(questionCount, q = []) {
  const counts = { yes: 0, partial: 0, no: 0, unknown: 0, na: 0 };
  for (let i = 0; i < questionCount; i++) if (q[i]) counts[q[i]]++;
  const answered = counts.yes + counts.partial + counts.no + counts.unknown + counts.na;
  if (answered === 0) return "unanswered";
  if (counts.na === answered) return "na";
  const decided = counts.yes + counts.partial + counts.no;
  if (decided === 0) return "unknown";
  if (counts.no === 0 && counts.partial === 0 && counts.unknown === 0 && answered === questionCount) return "implemented";
  if (counts.yes === 0 && counts.partial === 0 && counts.unknown === 0) return "not-implemented";
  return "partial";
}

export function evaluateControl(control, state) {
  const answer = getAnswer(state, control.id);
  const applicability = evaluateApplicability(control, state.profile, answer);
  let status;
  if (applicability.status === "na") status = "na";
  else if (applicability.status === "inherited") status = "inherited";
  else if (answer.override) status = answer.override;
  else status = deriveStatus(control.questions.length, answer.q);
  const openQuestions = control.questions.filter((_, i) => answer.q[i] === "unknown");
  return { control, answer, applicability, status, openQuestions };
}

export function evaluateAll(state) {
  return CONTROLS.map((c) => evaluateControl(c, state));
}

// ------------------------------------------------------------------ scoring

function summarize(results) {
  const counts = Object.fromEntries(Object.keys(STATUS).map((k) => [k, 0]));
  let earned = 0;
  let possible = 0;
  for (const r of results) {
    counts[r.status]++;
    const s = STATUS[r.status].score;
    if (s !== null) { earned += s; possible += 1; }
  }
  const assessed = results.filter((r) => !["unanswered", "na", "inherited"].includes(r.status)).length;
  const inScope = results.filter((r) => !["na", "inherited"].includes(r.status)).length;
  return {
    counts,
    total: results.length,
    inScope,
    assessed,
    progress: inScope ? assessed / inScope : 1,
    score: possible ? earned / possible : 1,
  };
}

export function scoreAssessment(state, results = evaluateAll(state)) {
  const byFamily = {};
  for (const f of FAMILIES) byFamily[f.id] = summarize(results.filter((r) => r.control.family === f.id));
  return { overall: summarize(results), byFamily };
}

// ------------------------------------------------------------------ risk & gaps

const SEV_WEIGHT = { high: 3, medium: 2, low: 1 };
const GAP_FACTOR = { "not-implemented": 1, unknown: 0.8, planned: 0.75, partial: 0.5 };

export function riskOf(severity, status) {
  const factor = GAP_FACTOR[status];
  if (factor === undefined) return null;
  const score = SEV_WEIGHT[severity] * factor;
  const level = score >= 2.25 ? "High" : score >= 1 ? "Medium" : "Low";
  return { score, level };
}

export function gapRegister(state, results = evaluateAll(state)) {
  return results
    .map((r) => ({ ...r, risk: riskOf(r.control.sev, r.status) }))
    .filter((r) => r.risk)
    .sort((a, b) => b.risk.score - a.risk.score || controlSortKey(a.control.id) - controlSortKey(b.control.id));
}

// ------------------------------------------------------------------ statements

const IDP_TEXT = {
  "gc-sso": "the departmental identity provider (federated single sign-on)",
  local: "the product's account administration function",
  mixed: "the departmental identity provider (and the product's own accounts for external users)",
  none: "the platform identity service",
};

const HOSTING_TEXT = {
  "gc-csp": "a CCCS-assessed cloud service provider in a Canadian region",
  "other-cloud": "the cloud service provider",
  "gc-dc": "the government data centre",
  "vendor-dc": "the vendor's data centre",
  endpoint: "departmental end-user devices",
};

const CLASSIFICATION_TEXT = {
  unclassified: "Unclassified", pa: "Protected A", pb: "Protected B", pc: "Protected C",
};

export function fillTemplate(template, profile) {
  const vars = {
    product: profile.productName?.trim() || "The product",
    org: profile.org?.trim() || "The responsible organization",
    idp: IDP_TEXT[profile.identity] ?? IDP_TEXT["gc-sso"],
    hosting: HOSTING_TEXT[profile.hosting] ?? "the hosting provider",
    classification: CLASSIFICATION_TEXT[profile.classification] ?? "Protected B",
  };
  return template
    .replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m))
    // "{product}" may land mid-sentence; keep "The product" capitalized only at sentence start.
    .replace(/([^.!?]\s)The (product|responsible organization)\b/g, "$1the $2");
}

export function draftStatement(control, state) {
  const { applicability, status, answer } = evaluateControl(control, state);
  const base = fillTemplate(control.describe, state.profile);
  if (applicability.status === "na") {
    return `Not applicable. ${applicability.reason}`;
  }
  if (applicability.status === "inherited") {
    return `Inherited. ${applicability.reason} ${base}`;
  }
  const parts = [base];
  if (applicability.status === "shared") parts.push(`Shared responsibility: ${applicability.reason}`);
  if (["partial", "planned", "not-implemented"].includes(status)) {
    parts.push("This statement describes the target implementation. Current gaps and remediation are recorded in the plan of action and milestones.");
  }
  if (answer.compensating?.trim()) parts.push(`Compensating measures: ${answer.compensating.trim()}`);
  return parts.join(" ");
}

export function statementFor(control, state) {
  const custom = getAnswer(state, control.id).statement?.trim();
  return custom ? { text: custom, draft: false } : { text: draftStatement(control, state), draft: true };
}

// ------------------------------------------------------------------ document review

const CAVEAT = /\b(not|without|lacks?|lacking|missing|planned|roadmap|future release|tbd|todo|optional(ly)?|partial(ly)?|upon request|on request|not yet|in progress|under development)\b|n't\b/i;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Keywords match on word boundaries; a trailing "*" makes the keyword a prefix.
export function keywordRegex(keyword) {
  const prefix = keyword.endsWith("*");
  const k = prefix ? keyword.slice(0, -1) : keyword;
  const start = /^\w/.test(k) ? "\\b" : "";
  const end = !prefix && /\w$/.test(k) ? "\\b" : "";
  return new RegExp(`${start}${escapeRegex(k)}${end}`, "i");
}

export function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 3);
}

const PROFILE_HINTS = [
  { field: "hosting", value: "gc-csp", re: /\b(canada central|canada east|ca-central-1|ca-west-1|northamerica-northeast[12]|canadian (data centre|data center|region))/i },
  { field: "operator", value: "vendor", re: /\b(saas|software as a service|multi-tenant|hosted service)\b/i },
  { field: "identity", value: "gc-sso", re: /\b(saml|openid connect|oidc|single sign-on|sso|entra id|azure ad|active directory federation)\b/i },
  { field: "identity", value: "local", re: /\b(username and password|local accounts?|built-in accounts?)\b/i },
  { field: "classification", value: "pb", re: /\bprotected b\b/i },
  { field: "classification", value: "pa", re: /\bprotected a\b/i },
  { field: "classification", value: "pc", re: /\b(protected c|secret|top secret)\b/i },
  { field: "mobile", value: "yes", re: /\b(ios|android|mobile app(lication)?)\b/i },
  { field: "remoteMaintenance", value: "yes", re: /\b(remote support|remote assistance|support access|screen sharing)\b/i },
  { field: "interconnections", value: "yes", re: /\b(api|apis|integrations?|webhooks?|data feed)\b/i },
  { field: "internetFacing", value: "yes", re: /\b(internet|public endpoint|publicly accessible|web browser)\b/i },
  { field: "removableMedia", value: "yes", re: /\b(usb|removable media|external drive|tape backup)\b/i },
];

export function analyzeText(text) {
  const sentences = splitSentences(text);
  const controls = {};
  for (const c of CONTROLS) {
    const regexes = c.keywords.map((k) => [k, keywordRegex(k)]);
    const evidence = [];
    const caveats = [];
    const terms = new Set();
    for (const s of sentences) {
      const hit = regexes.filter(([, re]) => re.test(s)).map(([k]) => k.replace(/\*$/, ""));
      if (!hit.length) continue;
      hit.forEach((k) => terms.add(k));
      (CAVEAT.test(s) ? caveats : evidence).push(s);
    }
    if (!evidence.length && !caveats.length) continue;
    controls[c.id] = {
      signal: evidence.length ? "evidence" : "caveat",
      terms: [...terms],
      evidence: evidence.slice(0, 4),
      caveats: caveats.slice(0, 4),
    };
  }
  const hints = [];
  for (const h of PROFILE_HINTS) {
    // A caveated sentence ("a mobile app is not yet available") is not evidence for scope.
    const s = sentences.find((x) => h.re.test(x) && !CAVEAT.test(x));
    if (s && !hints.some((x) => x.field === h.field)) hints.push({ field: h.field, value: h.value, evidence: s });
  }
  const covered = Object.keys(controls).length;
  return { controls, hints, sentenceCount: sentences.length, covered };
}

// ------------------------------------------------------------------ design levers

// Strategic design choices that remove or shrink many requirements at once.
export const LEVERS = [
  {
    id: "federate",
    title: "Federate sign-in to the departmental identity provider",
    why: "The product stops handling passwords, lockout, MFA and account lifecycle. Those become the IdP's job, which is already assessed and monitored.",
    when: (p) => ["local", "mixed"].includes(p.identity),
    controls: ["AC-2", "AC-7", "AC-8", "AC-11", "AC-12", "IA-2", "IA-4", "IA-5", "IA-6", "PS-4", "PS-5"],
  },
  {
    id: "assessed-cloud",
    title: "Host on a CCCS-assessed cloud in a Canadian region",
    why: "Physical, environmental, media and hardware maintenance controls become inherited, and data residency is addressed.",
    when: (p) => ["other-cloud", "vendor-dc"].includes(p.hosting),
    controls: ["PE-2", "PE-3", "PE-6", "PE-8", "PE-11", "PE-13", "PE-14", "MP-2", "MP-4", "MP-5", "MP-6", "MA-2", "MA-5", "CP-6", "CP-7", "SA-9"],
  },
  {
    id: "no-media",
    title: "Remove removable media from the workflow",
    why: "If information never leaves on USB keys, disks or tapes, media protection falls to the hosting provider.",
    when: (p) => p.removableMedia === "yes",
    controls: ["MP-2", "MP-4", "MP-5", "MP-6", "MP-7"],
  },
  {
    id: "no-remote-support",
    title: "Replace vendor remote access with customer-approved, time-limited support",
    why: "Removing standing vendor access shrinks remote maintenance and third-party personnel exposure.",
    when: (p) => p.remoteMaintenance === "yes",
    controls: ["MA-4", "MA-5", "PS-3", "PS-7", "AC-17"],
  },
  {
    id: "pipeline",
    title: "Make the deployment pipeline the only path to production",
    why: "Peer-reviewed pull requests, automated tests and pipeline-only deployment satisfy change control, separation of duties and developer configuration management in one stroke.",
    when: () => false,
    controls: ["CM-2", "CM-3", "CM-4", "CM-5", "AC-5", "SA-10", "SA-11", "CM-11"],
  },
  {
    id: "managed-services",
    title: "Prefer managed platform services over self-managed servers",
    why: "The provider patches, hardens and logs the platform; the team only owns its code and configuration.",
    when: (p) => ["vendor-dc", "gc-dc"].includes(p.hosting) && p.operator === "department",
    controls: ["SI-2", "SI-3", "CM-6", "CM-7", "AU-12", "MA-2"],
  },
  {
    id: "central-logging",
    title: "Send all logs to the departmental SIEM / SOC",
    why: "Review, alerting, retention and protection of logs become central services rather than product work.",
    when: () => false,
    controls: ["AU-4", "AU-5", "AU-6", "AU-9", "AU-11", "SI-4", "IR-5"],
  },
  {
    id: "minimize",
    title: "Collect and keep less data",
    why: "Data you do not hold cannot be breached. Minimization can lower the security category and shrinks retention and spillage obligations.",
    when: (p) => ["pb", "pc"].includes(p.classification),
    controls: ["RA-2", "SC-28", "SI-12", "IR-9", "MP-6"],
  },
];

export function designLevers(state, results = evaluateAll(state)) {
  const byId = Object.fromEntries(results.map((r) => [r.control.id, r]));
  return LEVERS.map((l) => {
    const affected = l.controls.map((id) => byId[id]).filter(Boolean);
    const gaps = affected.filter((r) => GAP_FACTOR[r.status] !== undefined);
    return { ...l, recommended: l.when(state.profile) || gaps.length >= 2, affected, gaps };
  }).filter((l) => l.recommended)
    .sort((a, b) => b.gaps.length - a.gaps.length);
}

export { FAMILIES, FAMILY_MAP };
