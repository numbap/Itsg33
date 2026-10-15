import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CONTROLS, CONTROL_MAP, FAMILIES, analyzeText, deriveStatus, designLevers, draftStatement,
  evaluateApplicability, evaluateControl, fillTemplate, gapRegister, keywordRegex, newState,
  riskOf, scoreAssessment, statementFor,
} from "../js/engine.js";
import { PROFILE_FIELDS, profileWarnings } from "../js/data/scoping.js";
import { buildReportModel, reportToCSV, reportToHTML, reportToMarkdown } from "../js/report.js";

const GEMBA_FIELDS = ["summary", "look", "eliminate", "consequences", "mitigations", "describe", "questions", "keywords"];

test("catalog: every family has a policy control and unique control IDs", () => {
  const ids = CONTROLS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate control id");
  for (const f of FAMILIES) assert.ok(CONTROL_MAP[`${f.id}-1`], `${f.id}-1 missing`);
});

test("catalog: every control has complete Gemba guidance", () => {
  for (const c of CONTROLS) {
    for (const k of GEMBA_FIELDS) {
      assert.ok(c[k] && c[k].length, `${c.id} missing ${k}`);
    }
    assert.ok(["high", "medium", "low"].includes(c.sev), `${c.id} bad severity`);
    assert.ok(FAMILIES.some((f) => f.id === c.family), `${c.id} unknown family`);
  }
});

test("catalog: scope rules reference real profile fields and values", () => {
  const fields = Object.fromEntries(PROFILE_FIELDS.map((f) => [f.id, f]));
  for (const c of CONTROLS) {
    for (const rule of c.scope) {
      assert.ok(["applicable", "shared", "inherited", "na"].includes(rule.status), `${c.id} bad status`);
      assert.ok(rule.reason, `${c.id} rule without reason`);
      for (const [k, v] of Object.entries(rule.when)) {
        const f = fields[k];
        assert.ok(f, `${c.id} scope uses unknown field ${k}`);
        const allowed = f.type === "yesno" ? ["yes", "no"] : f.options.map((o) => o.value);
        for (const val of [v].flat()) assert.ok(allowed.includes(val), `${c.id} scope ${k}=${val} invalid`);
      }
    }
  }
});

test("catalog: describe templates only use known placeholders", () => {
  for (const c of CONTROLS) {
    const out = fillTemplate(c.describe, newState().profile);
    assert.doesNotMatch(out, /\{\w+\}/, `${c.id} has unknown placeholder`);
  }
});

test("applicability follows the profile and manual overrides win", () => {
  const s = newState();
  s.profile.wireless = "no";
  assert.equal(evaluateApplicability(CONTROL_MAP["AC-18"], s.profile).status, "na");
  s.profile.wireless = "yes";
  assert.equal(evaluateApplicability(CONTROL_MAP["AC-18"], s.profile).status, "applicable");

  s.profile.hosting = "gc-csp";
  assert.equal(evaluateApplicability(CONTROL_MAP["PE-3"], s.profile).status, "inherited");
  s.profile.hosting = "vendor-dc";
  assert.equal(evaluateApplicability(CONTROL_MAP["PE-3"], s.profile).status, "applicable");

  s.profile.identity = "gc-sso";
  assert.equal(evaluateApplicability(CONTROL_MAP["AC-7"], s.profile).status, "inherited");
  s.profile.identity = "local";
  assert.equal(evaluateApplicability(CONTROL_MAP["AC-7"], s.profile).status, "applicable");

  const r = evaluateApplicability(CONTROL_MAP["AC-7"], s.profile, { applicability: "na" });
  assert.equal(r.status, "na");
  assert.equal(r.overridden, true);
});

test("multi-value scope conditions require every key to match", () => {
  const s = newState();
  s.profile.hosting = "gc-csp";
  s.profile.removableMedia = "no";
  assert.equal(evaluateApplicability(CONTROL_MAP["MP-6"], s.profile).status, "inherited");
  s.profile.removableMedia = "yes";
  assert.equal(evaluateApplicability(CONTROL_MAP["MP-6"], s.profile).status, "applicable");
});

test("deriveStatus maps answers to a control status", () => {
  assert.equal(deriveStatus(3, []), "unanswered");
  assert.equal(deriveStatus(2, ["yes", "yes"]), "implemented");
  assert.equal(deriveStatus(2, ["yes", "na"]), "implemented");
  assert.equal(deriveStatus(2, ["yes"]), "partial", "incomplete answers are not implemented");
  assert.equal(deriveStatus(2, ["no", "no"]), "not-implemented");
  assert.equal(deriveStatus(2, ["yes", "no"]), "partial");
  assert.equal(deriveStatus(2, ["unknown", "unknown"]), "unknown");
  assert.equal(deriveStatus(2, ["yes", "unknown"]), "partial");
  assert.equal(deriveStatus(2, ["na", "na"]), "na");
});

test("override and inheritance take precedence over answers", () => {
  const s = newState();
  s.answers["IA-2"] = { q: ["no", "no", "no", "no"], override: "planned" };
  assert.equal(evaluateControl(CONTROL_MAP["IA-2"], s).status, "planned");
  s.profile.hosting = "gc-csp";
  s.answers["PE-3"] = { q: ["no"] };
  assert.equal(evaluateControl(CONTROL_MAP["PE-3"], s).status, "inherited");
});

test("scoring weights statuses and excludes not-applicable controls", () => {
  const s = newState();
  for (const c of CONTROLS) {
    s.answers[c.id] = { q: c.questions.map(() => "yes") };
  }
  const full = scoreAssessment(s).overall;
  assert.equal(full.score, 1);
  assert.equal(full.progress, 1);

  const ac = CONTROLS.filter((c) => c.family === "AC" && evaluateControl(c, s).status === "implemented");
  s.answers[ac[0].id] = { q: ac[0].questions.map(() => "no") };
  const fam = scoreAssessment(s).byFamily.AC;
  assert.ok(fam.score < 1 && fam.score > 0);
  assert.equal(fam.counts["not-implemented"], 1);
});

test("risk ranks high-severity unmet controls first", () => {
  assert.equal(riskOf("high", "not-implemented").level, "High");
  assert.equal(riskOf("low", "partial").level, "Low");
  assert.equal(riskOf("high", "implemented"), null);
  const s = newState();
  s.answers["CM-10"] = { q: ["no"] };
  s.answers["SC-8"] = { q: ["no", "no", "no"] };
  const gaps = gapRegister(s).filter((g) => ["CM-10", "SC-8"].includes(g.control.id));
  assert.deepEqual(gaps.map((g) => g.control.id), ["SC-8", "CM-10"]);
});

test("statements are filled from the profile and flag gaps", () => {
  const s = newState();
  s.profile.productName = "CaseTrack";
  s.profile.org = "Acme";
  const text = draftStatement(CONTROL_MAP["SC-8"], s);
  assert.match(text, /CaseTrack/);
  s.answers["SC-8"] = { q: ["no", "no", "no"], compensating: "VPN only" };
  const gapText = draftStatement(CONTROL_MAP["SC-8"], s);
  assert.match(gapText, /plan of action/);
  assert.match(gapText, /VPN only/);
  s.answers["SC-8"].statement = "Custom text";
  assert.deepEqual(statementFor(CONTROL_MAP["SC-8"], s), { text: "Custom text", draft: false });
});

test("unnamed product reads naturally mid-sentence", () => {
  const out = fillTemplate("Authentication for {product} is done. {product} works.", newState().profile);
  assert.equal(out, "Authentication for the product is done. The product works.");
});

test("keyword matching respects word boundaries and prefixes", () => {
  assert.ok(keywordRegex("mfa").test("MFA is enforced"));
  assert.ok(!keywordRegex("ato").test("atomic operations"));
  assert.ok(keywordRegex("throttl*").test("requests are throttled"));
  assert.ok(keywordRegex("poa&m").test("tracked in the POA&M."));
});

test("document analysis maps sentences to controls and profile hints", () => {
  const text = `Hosted in Azure Canada Central. Users sign in with SAML single sign-on and MFA is enforced.
All data is encrypted at rest with AES-256. Disaster recovery testing is planned for next year.`;
  const r = analyzeText(text);
  assert.equal(r.controls["IA-2"].signal, "evidence");
  assert.equal(r.controls["SC-28"].signal, "evidence");
  assert.equal(r.controls["CP-4"].signal, "caveat");
  assert.ok(r.hints.some((h) => h.field === "hosting" && h.value === "gc-csp"));
  assert.ok(r.hints.some((h) => h.field === "identity" && h.value === "gc-sso"));
});

test("design levers recommend federation for local accounts", () => {
  const s = newState();
  s.profile.identity = "local";
  assert.ok(designLevers(s).some((l) => l.id === "federate"));
  s.profile.identity = "gc-sso";
  assert.ok(!designLevers(s).some((l) => l.id === "federate"));
});

test("profile warnings flag out-of-profile and residency issues", () => {
  assert.equal(profileWarnings(newState().profile).length, 0);
  const p = { ...newState().profile, classification: "pc", hosting: "other-cloud" };
  assert.ok(profileWarnings(p).some((w) => /Protected C/.test(w)));
  p.classification = "pb";
  assert.ok(profileWarnings(p).some((w) => /residency/.test(w)));
});

test("report renders in all formats and escapes user input", () => {
  const s = newState();
  s.profile.productName = "<script>alert(1)</script>";
  s.answers["AC-2"] = { q: ["no", "no", "no", "no", "no"], notes: 'a "quoted", note', plan: "Federate | SCIM" };
  const m = buildReportModel(s);
  const html = reportToHTML(m);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  const md = reportToMarkdown(m);
  assert.match(md, /## 5\. Gap register/);
  assert.match(md, /AC-2 Account Management — High risk/);
  const csv = reportToCSV(m);
  assert.equal(csv.split("\r\n").length, CONTROLS.length + 1);
  assert.match(csv, /"a ""quoted"", note"/);
});

test("caveated sentences do not produce scope hints; unassessed controls are not gaps", () => {
  const r = analyzeText("A mobile app for iOS is not yet available.");
  assert.ok(!r.hints.some((h) => h.field === "mobile"));
  const s = newState();
  assert.equal(gapRegister(s).length, 0);
  assert.ok(buildReportModel(s).unassessed.length > 0);
});
