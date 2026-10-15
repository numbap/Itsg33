# ITSG-33 Compliance Navigator

A browser app for reviewing a software product against the **ITSG-33** security controls (PBMM-oriented baseline) and generating a compliance report. For each requirement it **walks the Gemba**: where to go and look, how the product could be designed to *eliminate* the requirement, what happens if you *break* it, how to *mitigate*, and how to *describe* it to an assessor.

## Workflow

1. **Scope**: a short interview (hosting, identity, users, data sensitivity, connections, media, and so on). Each answer explains *why it is asked*, and the answers decide whether each control is applicable, shared, inherited or not applicable.
2. **Review documents**: paste or load vendor security documentation. The review maps sentences to controls, flags caveats ("planned", "optional", "not yet") and suggests scope changes. It runs locally and nothing is uploaded.
3. **Questionnaire**: plain-language yes / partly / no / don't know questions for each control, with the Gemba walk alongside. It also records evidence, compensating measures, a remediation plan, a target date and the implementation statement (a draft can be generated from the profile).
4. **Report**: executive summary, scores by family, design opportunities that remove whole groups of requirements, a risk-ranked gap register / POA&M with consequences and mitigations, open questions, inherited controls and implementation statements. You can export it as print/PDF, Markdown or CSV, and the whole assessment as JSON.

The **Gemba library** lets you browse all 133 controls (17 families, including the generated `-1` policy controls) without running an assessment.

## Running

The app has no runtime dependencies and no build step.

```sh
npm start        # serves on http://localhost:8080 (PORT to override)
npm test         # unit tests: engine, data integrity, report output, VPAT generator
```

Any static host (for example GitHub Pages) also works. ES modules need to be served over HTTP; opening `index.html` directly from `file://` will not load them.

## Privacy and Protected B

The application is open source (MIT, see `LICENSE`) and runs entirely in the browser. **Nothing you enter is sent to any server.** A Content Security Policy (`connect-src 'none'`) blocks network connections, and tests fail the build if the client code uses network or cookie APIs. The application sets no cookies.

On first use you choose how the assessment is kept:

| Mode | Where | Allowed for |
|---|---|---|
| Encrypted (default) | `localStorage`, AES-256-GCM, key derived from your passphrase (PBKDF2-SHA-256, 600,000 iterations); auto-lock after inactivity | Unclassified, Protected A, Protected B |
| Not saved | Memory of the open tab only | All |
| Unencrypted | `localStorage` as plain JSON | Unclassified only (enforced in code) |

Every screen, report, printed page and export carries the security marking (Protected B by default). Encrypted exports use their own passphrase.

- Privacy policy: [`policies/privacy.html`](policies/privacy.html) (source `policies/privacy.md`)
- Protected B handling, ITSG-33 control mapping and **caveats** (managed device, hosting origin, cryptographic module validation, no audit trail): [`policies/protected-b.html`](policies/protected-b.html)

For Protected B use, departments should host a reviewed, pinned copy on their own infrastructure, on a dedicated origin with server-set security headers (see the caveats), and approve its use through their security process.

```sh
npm run test:security   # browser checks: CSP blocks network, ciphertext-only storage, lock, framing, erase
```

## Publishing (GitHub Pages)

Pushes to the default branch that pass all checks are deployed to GitHub Pages by `.github/workflows/accessibility.yml`. Only the site files are published (`index.html`, `css/`, `js/`, `policies/`, `accessibility/`, `LICENSE`). One-time setup by a repository admin: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Pages for a private repository needs a paid GitHub plan; the privacy policy's "open source" statement assumes the repository is public.

## Accessibility (WCAG 2.2 AA) and the VPAT

The interface targets **WCAG 2.2 Level AA** and **EN 301 549 v3.2.1** (CAN/ASC-EN 301 549:2024). The accessibility statement, the VPAT and the supporting evidence are published with the app at [`accessibility/index.html`](accessibility/index.html) and linked from every page's footer.

| Document | Path |
|---|---|
| Accessibility statement | `accessibility/index.html` |
| VPAT 2.5Rev (WCAG 2.2 + EN 301 549), HTML and Markdown | `accessibility/vpat.html`, `accessibility/VPAT.md` |
| Automated test report and raw results | `accessibility/test-report.html`, `accessibility/results/` |
| Strategy, scope and context, methodology, expertise and independence, remediation log | `accessibility/evidence/*.md` (rendered as HTML pages alongside) |

**Continuous compliance.** The VPAT is compiled, not hand-written. `scripts/build-vpat.mjs` merges the evaluator's judgements (`accessibility/evaluation/criteria.mjs`) with the latest automated results. Any failed automated check downgrades the affected criteria. The `Accessibility (VPAT)` GitHub workflow runs on every push and pull request: it tests every page state, recompiles the VPAT, uploads it as an artifact, commits the recompiled documentation back to the branch when it changed, and fails if any check failed. When UI code changes after the last manual review, the VPAT shows "Manual review pending" until a reviewer runs `npm run a11y:attest`.

```sh
npx playwright install chromium   # once
npm run a11y                       # build docs → run accessibility suite → recompile VPAT (strict)
npm run vpat                       # recompile the VPAT from existing results
npm run a11y:attest -- --reviewer "Name, credential" --notes "Scope"   # record a manual review
```

The current evaluation is a **self-assessment by an AI assistant**. It has not been verified with screen readers or by an independent auditor. See `accessibility/evidence/04-expertise-and-independence.md`.

## Structure

| Path | Purpose |
|---|---|
| `js/data/families.js` | 17 control families, classes, intent and Gemba tips |
| `js/data/controls-*.js` | Controls with Gemba content, questions, analyzer keywords and scope rules |
| `js/data/scoping.js` | Scoping interview and profile warnings |
| `js/engine.js` | Applicability, status derivation, scoring, risk, statements, document analysis, design levers (pure functions) |
| `js/report.js` | Report model rendered to HTML, Markdown and CSV |
| `js/app.js` | UI: routing, views, events, focus management and live announcements; state kept in `localStorage` |
| `js/sample.js` | Sample product (also the accessibility test fixture) |
| `js/vault.js`, `js/storage.js` | Encryption (Web Crypto) and storage modes, with the Protected-information policy enforced in code |
| `policies/` | Privacy policy and Protected B handling (Markdown sources, generated HTML) |
| `tests/security/` | Browser security checks |
| `tests/a11y/` | Accessibility suite: axe-core runner and scripted WCAG checks |
| `scripts/build-vpat.mjs` | Compiles the VPAT, statement, test report and evidence pages |
| `accessibility/evaluation/` | Per-criterion evaluation and the manual review record |
| `.github/workflows/accessibility.yml` | CI: test, recompile, commit back, enforce |

### Adding or editing a control

Add an object to the relevant `controls-*.js` file. The tests check that every control has complete Gemba fields, that scope rules use real profile fields and values, and that templates only use the known placeholders (`{product}`, `{org}`, `{idp}`, `{hosting}`, `{classification}`). In `keywords`, a trailing `*` matches a prefix (`throttl*`).

## Scoring

Implemented and inherited count as 1, partial 0.5, planned 0.25, and everything else 0; not-applicable controls are excluded. Gap risk is the baseline severity weighted by status. Controls that have not been assessed yet score 0 but are listed separately rather than as gaps.

## Limitations

- The control text is **paraphrased** and covers base controls only (no enhancements). Check the official ITSG-33 publications from the Canadian Centre for Cyber Security for authoritative wording and for your departmental profile.
- The document review is keyword-based. Treat its matches as leads for the Gemba walk, not as proof.
- This is a self-assessment aid. It does not replace a security assessment and authorization (SA&A).
