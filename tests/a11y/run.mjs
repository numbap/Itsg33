// Accessibility test runner. Drives every page state in Chromium, runs axe-core
// (WCAG 2.0/2.1/2.2 A and AA rules) in light and dark themes, plus the scripted
// checks in checks.mjs, and writes accessibility/results/automated-results.json.
// The VPAT generator (scripts/build-vpat.mjs) compiles the VPAT from that file.
//
//   node tests/a11y/run.mjs            write results, exit 1 on any failure
//   node tests/a11y/run.mjs --out FILE write results somewhere else (e.g. a baseline)

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startServer } from "../../server.mjs";
import { sampleState } from "../../js/sample.js";
import { analyzeText } from "../../js/engine.js";
import {
  BROWSER_HELPERS, keyboardTraversal, lookalikeControls, noHorizontalScroll, nonTextContrast,
  routeFocus, statusMessages, tabsPattern, targetSize, textSpacing,
} from "./checks.mjs";

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const outArg = process.argv.indexOf("--out");
const OUT = outArg > 0 ? process.argv[outArg + 1] : join(ROOT, "accessibility/results/automated-results.json");
const PORT = Number(process.env.A11Y_PORT) || 8765;
const BASE = `http://localhost:${PORT}`;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa", "best-practice"];

// ------------------------------------------------------------------ fixture

// A realistic, deterministic assessment so every view renders with content.
function fixtureState() {
  const s = sampleState();
  s.createdAt = s.updatedAt = "2026-01-01T00:00:00.000Z";
  s.review.results = analyzeText(s.review.text);
  s.review.analyzedAt = s.createdAt;
  s.answers["AC-2"] = { q: ["yes", "yes", "partial", "no", "unknown"], override: "", applicability: "", notes: "Reviewed the admin console export.", plan: "Enable SCIM provisioning", target: "2026-12-31", statement: "", compensating: "Monthly reconciliation against HR departures." };
  s.answers["IA-2"] = { q: ["yes", "yes", "yes", "unknown"], override: "", applicability: "", notes: "", plan: "", target: "", statement: "", compensating: "" };
  s.answers["SC-8"] = { q: ["yes", "yes", "yes"], override: "", applicability: "", notes: "TLS scan report attached.", plan: "", target: "", statement: "", compensating: "" };
  s.answers["CP-4"] = { q: ["no"], override: "", applicability: "", notes: "", plan: "Run first DR test", target: "2027-03-31", statement: "", compensating: "" };
  return s;
}

// ------------------------------------------------------------------ states

async function docStates() {
  const dir = join(ROOT, "accessibility");
  let files = [];
  try { files = (await readdir(dir)).filter((f) => f.endsWith(".html")).sort(); } catch { /* not built yet */ }
  return files.map((f) => ({ id: `docs/${f.replace(/\.html$/, "")}`, name: `Accessibility documentation: ${f}`, url: `/accessibility/${f}` }));
}

const APP_STATES = [
  { id: "home", name: "Start page", url: "/#/" },
  { id: "profile", name: "1. Scope (profile interview)", url: "/#/profile" },
  { id: "review", name: "2. Review documents, with findings", url: "/#/review" },
  { id: "review-toast", name: "2. Review documents, confirmation message showing", url: "/#/review",
    setup: (page) => page.click('[data-action="copy-evidence"]') },
  { id: "assess", name: "3. Questionnaire, AC family with AC-2 expanded", url: "/#/assess/AC/AC-2" },
  { id: "assess-pe", name: "3. Questionnaire, PE family (inherited controls) with PE-3 expanded", url: "/#/assess/PE/PE-3" },
  { id: "control", name: "Gemba page for a control (SC-28)", url: "/#/control/SC-28" },
  { id: "library", name: "Gemba library", url: "/#/library" },
  { id: "report", name: "4. Compliance report", url: "/#/report" },
];

// ------------------------------------------------------------------ helpers

const scFromTags = (tags) => tags
  .map((t) => t.match(/^wcag(\d)(\d)(\d+)$/))
  .filter(Boolean)
  .map((m) => `${m[1]}.${m[2]}.${m[3]}`);

const AXE_SOURCE = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const AXE_VERSION = JSON.parse(await readFile(require.resolve("axe-core/package.json"), "utf8")).version;
const PW_VERSION = JSON.parse(await readFile(require.resolve("playwright/package.json"), "utf8")).version;

async function openPage(browser, { theme = "light", width = 1280, height = 900 } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: "reduce" });
  const state = JSON.stringify(fixtureState());
  await context.addInitScript(([s, t]) => {
    try { localStorage.setItem("itsg33-navigator-state", s); localStorage.removeItem("itsg33-theme"); } catch { /* ignore */ }
    window.__theme = t;
  }, [state, theme]);
  await context.addInitScript(BROWSER_HELPERS);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return { page, context, errors };
}

async function load(page, url, setup) {
  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState("networkidle");
  if (setup) await setup(page);
  await page.waitForTimeout(100);
}

async function runAxe(page) {
  await page.addScriptTag({ content: AXE_SOURCE });
  return page.evaluate(async (tags) => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: tags }, resultTypes: ["violations", "incomplete"] });
    const slim = (x) => ({ id: x.id, impact: x.impact, help: x.help, tags: x.tags, nodes: x.nodes.map((n) => n.target.join(" ")).slice(0, 10), count: x.nodes.length });
    return { violations: r.violations.map(slim), incomplete: r.incomplete.map(slim), passes: r.passes.map(slim) };
  }, AXE_TAGS);
}

// ------------------------------------------------------------------ run

const server = await startServer(PORT);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const states = [...APP_STATES, ...(await docStates())];
const axeResults = [];
const axeRules = {};
const ARIA_DIR = join(dirname(OUT), "aria");
await mkdir(ARIA_DIR, { recursive: true });
const checks = [];
const pageErrors = [];
const record = (id, title, sc, state, variant, result, advisory = false) =>
  checks.push({ id, title, sc, state, variant, advisory, pass: result.pass, failures: result.failures.slice(0, 25) });

for (const st of states) {
  process.stdout.write(`• ${st.id}`);
  for (const theme of ["light", "dark"]) {
    const { page, context, errors } = await openPage(browser, { theme });
    await load(page, st.url, st.setup);
    const axe = await runAxe(page);
    for (const x of [...axe.violations, ...axe.incomplete, ...axe.passes]) axeRules[x.id] ??= { help: x.help, sc: scFromTags(x.tags) };
    axeResults.push({
      state: st.id, theme,
      violations: axe.violations.map(({ tags, ...v }) => ({ ...v, sc: scFromTags(tags), wcag: scFromTags(tags).length > 0 })),
      incomplete: axe.incomplete.map((v) => ({ id: v.id, count: v.count })),
      passes: axe.passes.map((p) => p.id).sort(),
    });
    if (theme === "light") {
      const tree = await page.locator("body").ariaSnapshot();
      await writeFile(join(ARIA_DIR, `${st.id.replace(/\//g, "-")}.yml`), `# Accessibility tree exposed to assistive technology: ${st.name}\n# Generated by tests/a11y/run.mjs (Playwright ariaSnapshot), Chromium, light theme, 1280px.\n${tree}\n`);
    }

    const kb = await keyboardTraversal(page);
    record("keyboard-reach", "Every focusable control can be reached with Tab", ["2.1.1"], st.id, theme, kb.reach);
    record("no-keyboard-trap", "Focus can move through and out of the page", ["2.1.2"], st.id, theme, kb.trap);
    record("focus-visible", "Visible focus indicator with at least 3:1 contrast at every stop", ["2.4.7", "1.4.11"], st.id, theme, kb.focusVisible);
    record("focus-not-obscured", "Focused element is not hidden behind sticky content", ["2.4.11"], st.id, theme, kb.notObscured);
    await load(page, st.url, st.setup);
    record("non-text-contrast", "Form field and choice boundaries have at least 3:1 contrast", ["1.4.11"], st.id, theme, await nonTextContrast(page));
    if (theme === "light") {
      record("lookalike-controls", "Controls that look interactive are keyboard operable", ["2.1.1", "4.1.2"], st.id, theme, await lookalikeControls(page));
      record("target-size", "Pointer targets are at least 24 by 24 CSS px", ["2.5.8"], st.id, theme, await targetSize(page));
    }
    pageErrors.push(...errors.map((e) => `${st.id}/${theme}: ${e}`));
    await context.close();
  }

  for (const [w, sc, title] of [[320, ["1.4.10"], "No horizontal scrolling at 320 CSS px (400% zoom)"], [640, ["1.4.4"], "No loss of content at 640 CSS px (200% zoom)"]]) {
    const { page, context } = await openPage(browser, { width: w, height: 800 });
    await load(page, st.url, st.setup);
    record(`reflow-${w}`, title, sc, st.id, `${w}px`, await noHorizontalScroll(page));
    if (w === 320) {
      // Narrow layouts can introduce their own failures (e.g. scrollable regions), so axe runs here too.
      const axe = await runAxe(page);
      for (const x of [...axe.violations, ...axe.incomplete, ...axe.passes]) axeRules[x.id] ??= { help: x.help, sc: scFromTags(x.tags) };
      axeResults.push({
        state: st.id, theme: "light 320px",
        violations: axe.violations.map(({ tags, ...v }) => ({ ...v, sc: scFromTags(tags), wcag: scFromTags(tags).length > 0 })),
        incomplete: axe.incomplete.map((v) => ({ id: v.id, count: v.count })),
        passes: axe.passes.map((p) => p.id).sort(),
      });
    }
    await context.close();
  }
  for (const w of [1280, 320]) {
    const { page, context } = await openPage(browser, { width: w, height: 800 });
    await load(page, st.url, st.setup);
    record("text-spacing", "No clipped content with WCAG text-spacing overrides", ["1.4.12"], st.id, `${w}px`, await textSpacing(page));
    await context.close();
  }
  process.stdout.write(" ✓\n");
}

// Interaction checks across the app.
{
  const { page, context } = await openPage(browser);
  record("route-focus", "Navigation moves focus to the new page heading and updates title", ["2.4.3", "2.4.2", "4.1.2"], "app", "light", await routeFocus(page, BASE));
  record("tabs-pattern", "Gemba tabs follow the ARIA tabs pattern with arrow keys", ["2.1.1", "4.1.2"], "assess", "light", await tabsPattern(page, BASE));
  record("status-messages", "Results of actions are announced without moving focus", ["4.1.3", "2.1.1"], "app", "light", await statusMessages(page, BASE));
  await context.close();
}

await browser.close();
server.close();

// ------------------------------------------------------------------ output

const wcagViolations = axeResults.flatMap((a) => a.violations.filter((v) => v.wcag).map((v) => ({ ...v, state: a.state, theme: a.theme })));
const advisoryViolations = axeResults.flatMap((a) => a.violations.filter((v) => !v.wcag).map((v) => ({ ...v, state: a.state, theme: a.theme })));
const failedChecks = checks.filter((c) => !c.pass && !c.advisory);
const results = {
  schema: 1,
  tools: { "axe-core": AXE_VERSION, playwright: PW_VERSION, browser: `Chromium (Playwright ${PW_VERSION})` },
  axeTags: AXE_TAGS,
  states: states.map(({ id, name, url, setup }) => ({ id, name, url, ...(setup ? { setup: setup.toString().replace(/\s+/g, " ") } : {}) })),
  axeRules: Object.fromEntries(Object.entries(axeRules).sort(([a], [b]) => a.localeCompare(b))),
  variants: ["light theme 1280px", "dark theme 1280px", "320px", "640px", "text-spacing overrides"],
  summary: {
    pageStates: states.length,
    axeRuns: axeResults.length,
    wcagViolations: wcagViolations.length,
    advisoryViolations: advisoryViolations.length,
    checksRun: checks.length,
    checksFailed: failedChecks.length,
    pageErrors: pageErrors.length,
    pass: wcagViolations.length === 0 && failedChecks.length === 0 && pageErrors.length === 0,
  },
  axe: axeResults,
  checks,
  pageErrors,
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(results, null, 2)}\n`);

console.log(`\naxe: ${wcagViolations.length} WCAG violation(s), ${advisoryViolations.length} best-practice issue(s) across ${axeResults.length} runs`);
for (const v of wcagViolations) console.log(`  ✗ [${v.state}/${v.theme}] ${v.id} (${v.sc.join(", ")}) ${v.help} → ${v.nodes.slice(0, 3).join(" ; ")}`);
for (const v of advisoryViolations) console.log(`  ! [${v.state}/${v.theme}] ${v.id} ${v.help} → ${v.nodes.slice(0, 2).join(" ; ")}`);
console.log(`checks: ${checks.length - failedChecks.length}/${checks.length} passed`);
for (const c of failedChecks) console.log(`  ✗ [${c.state}/${c.variant}] ${c.id}: ${c.failures.slice(0, 4).join(" ; ")}`);
for (const e of pageErrors) console.log(`  ✗ page error ${e}`);
console.log(`results written to ${OUT}`);
process.exit(results.summary.pass ? 0 : 1);
