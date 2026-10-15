# ITSG-33 Compliance Navigator

A browser app for reviewing a software product against the **ITSG-33** security controls (PBMM-oriented baseline) and generating a compliance report. For each requirement it **walks the Gemba**: where to go and look, how the product could be designed to *eliminate* the requirement, what happens if you *break* it, how to *mitigate*, and how to *describe* it to an assessor.

## Workflow

1. **Scope**: a short interview (hosting, identity, users, data sensitivity, connections, media, and so on). Each answer explains *why it is asked*, and the answers decide whether each control is applicable, shared, inherited or not applicable.
2. **Review documents**: paste or load vendor security documentation. The review maps sentences to controls, flags caveats ("planned", "optional", "not yet") and suggests scope changes. It runs locally and nothing is uploaded.
3. **Questionnaire**: plain-language yes / partly / no / don't know questions for each control, with the Gemba walk alongside. It also records evidence, compensating measures, a remediation plan, a target date and the implementation statement (a draft can be generated from the profile).
4. **Report**: executive summary, scores by family, design opportunities that remove whole groups of requirements, a risk-ranked gap register / POA&M with consequences and mitigations, open questions, inherited controls and implementation statements. You can export it as print/PDF, Markdown or CSV, and the whole assessment as JSON.

The **Gemba library** lets you browse all 133 controls (17 families, including the generated `-1` policy controls) without running an assessment.

## Running

No dependencies and no build step.

```sh
npm start        # serves on http://localhost:8080 (PORT to override)
npm test         # node:test suite for the engine, data integrity and report output
```

Any static host (for example GitHub Pages) also works. ES modules need to be served over HTTP; opening `index.html` directly from `file://` will not load them.

## Structure

| Path | Purpose |
|---|---|
| `js/data/families.js` | 17 control families, classes, intent and Gemba tips |
| `js/data/controls-*.js` | Controls with Gemba content, questions, analyzer keywords and scope rules |
| `js/data/scoping.js` | Scoping interview and profile warnings |
| `js/engine.js` | Applicability, status derivation, scoring, risk, statements, document analysis, design levers (pure functions) |
| `js/report.js` | Report model rendered to HTML, Markdown and CSV |
| `js/app.js` | UI: routing, views and events; state kept in `localStorage` |

### Adding or editing a control

Add an object to the relevant `controls-*.js` file. The tests check that every control has complete Gemba fields, that scope rules use real profile fields and values, and that templates only use the known placeholders (`{product}`, `{org}`, `{idp}`, `{hosting}`, `{classification}`). In `keywords`, a trailing `*` matches a prefix (`throttl*`).

## Scoring

Implemented and inherited count as 1, partial 0.5, planned 0.25, and everything else 0; not-applicable controls are excluded. Gap risk is the baseline severity weighted by status. Controls that have not been assessed yet score 0 but are listed separately rather than as gaps.

## Limitations

- The control text is **paraphrased** and covers base controls only (no enhancements). Check the official ITSG-33 publications from the Canadian Centre for Cyber Security for authoritative wording and for your departmental profile.
- The document review is keyword-based. Treat its matches as leads for the Gemba walk, not as proof.
- This is a self-assessment aid. It does not replace a security assessment and authorization (SA&A).
