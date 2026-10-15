// Evaluation of the ITSG-33 Compliance Navigator against WCAG 2.2 Level A and AA
// and EN 301 549 v3.2.1. This file holds the evaluator's judgement for each
// criterion. scripts/build-vpat.mjs merges it with the automated results in
// accessibility/results/automated-results.json: an automated failure mapped to
// a criterion overrides the judgement below and downgrades the conformance level.
//
// methods: how the judgement was reached (see evidence/03-test-methodology.md)
//   automated    axe-core rules in Chromium, all page states, light and dark themes
//   scripted     Playwright scripted checks (tests/a11y/checks.mjs)
//   code-review  inspection of HTML templates, CSS and event handling
//   visual       inspection of rendered screenshots (themes, widths, forced colours)
//   aria-tree    inspection of the generated accessibility tree snapshots
// Not used: testing with screen readers or other assistive technology by people
// who rely on them. See evidence/04-expertise-and-independence.md.

export const LEVELS = { S: "Supports", P: "Partially Supports", D: "Does Not Support", NA: "Not Applicable", NE: "Not Evaluated" };

// since: WCAG version that introduced the criterion
export const WCAG = [
  // ------------------------------------------------------------ Level A
  { sc: "1.1.1", name: "Non-text Content", level: "A", since: "2.0", c: "S", methods: ["automated", "code-review", "aria-tree"],
    remarks: "The logo graphic is hidden from assistive technology and accompanied by the product name in text. Progress rings and score bars use role=img with a text alternative giving the percentage. Decorative glyphs (disclosure triangle, check marks, theme icon) are hidden with aria-hidden or empty CSS alternative text. The theme button has an accessible name." },
  { sc: "1.2.1", name: "Audio-only and Video-only (Prerecorded)", level: "A", since: "2.0", c: "NA", methods: ["code-review"], remarks: "The product contains no audio or video." },
  { sc: "1.2.2", name: "Captions (Prerecorded)", level: "A", since: "2.0", c: "NA", methods: ["code-review"], remarks: "The product contains no audio or video." },
  { sc: "1.2.3", name: "Audio Description or Media Alternative (Prerecorded)", level: "A", since: "2.0", c: "NA", methods: ["code-review"], remarks: "The product contains no video." },
  { sc: "1.3.1", name: "Info and Relationships", level: "A", since: "2.0", c: "S", methods: ["automated", "code-review", "aria-tree"],
    remarks: "Structure is conveyed with native semantics: landmarks, headings in order, lists, data tables with captions and th scope, fieldset/legend for each question, labelled radio groups for scoping questions, and labels for every field." },
  { sc: "1.3.2", name: "Meaningful Sequence", level: "A", since: "2.0", c: "S", methods: ["code-review", "visual"],
    remarks: "DOM order matches visual reading order. The only CSS reordering places the main navigation below the product name on narrow screens, which does not change meaning." },
  { sc: "1.3.3", name: "Sensory Characteristics", level: "A", since: "2.0", c: "S", methods: ["code-review"],
    remarks: "Instructions refer to sections by name, not by shape, size or position. One location-based instruction found during evaluation (“right-hand panel”) was reworded." },
  { sc: "1.4.1", name: "Use of Color", level: "A", since: "2.0", c: "S", methods: ["automated", "code-review", "visual"],
    remarks: "Status, risk, applicability and severity are always shown as text. Selected answers show a check mark and bold text in addition to colour. Links within text are underlined." },
  { sc: "1.4.2", name: "Audio Control", level: "A", since: "2.0", c: "NA", methods: ["code-review"], remarks: "The product plays no audio." },
  { sc: "2.1.1", name: "Keyboard", level: "A", since: "2.0", c: "S", methods: ["scripted", "code-review"],
    remarks: "All functions use native, keyboard-operable controls. Scripted checks Tab through every page state and confirm every focusable control is reached, that button-styled file pickers are keyboard operable, that the Gemba tabs work with arrow keys, and that questionnaire answers can be selected with the keyboard." },
  { sc: "2.1.2", name: "No Keyboard Trap", level: "A", since: "2.0", c: "S", methods: ["scripted"], remarks: "Scripted traversal confirms focus moves through and out of every page state." },
  { sc: "2.1.4", name: "Character Key Shortcuts", level: "A", since: "2.1", c: "NA", methods: ["code-review"],
    remarks: "No single-character shortcuts are defined. Arrow, Home and End keys act only while a tab has focus, and Escape dismisses the confirmation message." },
  { sc: "2.2.1", name: "Timing Adjustable", level: "A", since: "2.0", c: "NA", methods: ["code-review"],
    remarks: "The product sets no time limits. Confirmation messages stay visible until dismissed; an earlier auto-hiding message was changed during evaluation." },
  { sc: "2.2.2", name: "Pause, Stop, Hide", level: "A", since: "2.0", c: "NA", methods: ["code-review"], remarks: "There is no moving, blinking, scrolling or auto-updating content." },
  { sc: "2.3.1", name: "Three Flashes or Below Threshold", level: "A", since: "2.0", c: "S", methods: ["code-review"], remarks: "No content flashes. Transitions are disabled when the user prefers reduced motion." },
  { sc: "2.4.1", name: "Bypass Blocks", level: "A", since: "2.0", c: "S", methods: ["automated", "code-review"], remarks: "A skip link is the first focusable element, and pages use banner, navigation, main and contentinfo landmarks." },
  { sc: "2.4.2", name: "Page Titled", level: "A", since: "2.0", c: "S", methods: ["automated", "scripted"],
    remarks: "Each view sets a unique, descriptive document title on navigation (verified by the route-focus check). Documentation pages have unique titles." },
  { sc: "2.4.3", name: "Focus Order", level: "A", since: "2.0", c: "S", methods: ["scripted", "code-review"],
    remarks: "Focus order follows the DOM. After in-app navigation focus moves to the new page heading (or to the requested control); after an action re-renders a view, focus returns to the control that triggered it." },
  { sc: "2.4.4", name: "Link Purpose (In Context)", level: "A", since: "2.0", c: "S", methods: ["automated", "code-review"],
    remarks: "Link text is descriptive or made clear by its card or list item (e.g. control links show the control ID and title)." },
  { sc: "2.5.1", name: "Pointer Gestures", level: "A", since: "2.1", c: "NA", methods: ["code-review"], remarks: "No multipoint or path-based gestures are used." },
  { sc: "2.5.2", name: "Pointer Cancellation", level: "A", since: "2.1", c: "S", methods: ["code-review"], remarks: "All actions use native click activation, which fires on release and can be cancelled by moving the pointer away." },
  { sc: "2.5.3", name: "Label in Name", level: "A", since: "2.1", c: "S", methods: ["automated", "code-review", "aria-tree"],
    remarks: "Accessible names contain the visible label text. Buttons with extra context (“Apply: Where does it run?”, “Dismiss message”) start with the visible label." },
  { sc: "2.5.4", name: "Motion Actuation", level: "A", since: "2.1", c: "NA", methods: ["code-review"], remarks: "No functions are triggered by device motion." },
  { sc: "3.1.1", name: "Language of Page", level: "A", since: "2.0", c: "S", methods: ["automated"], remarks: "All pages declare lang=\"en\"." },
  { sc: "3.2.1", name: "On Focus", level: "A", since: "2.0", c: "S", methods: ["code-review", "scripted"], remarks: "Receiving focus never changes context." },
  { sc: "3.2.2", name: "On Input", level: "A", since: "2.0", c: "S", methods: ["code-review"],
    remarks: "Changing a field updates related summaries, statuses and search results on the same page but never navigates, submits or moves focus." },
  { sc: "3.2.6", name: "Consistent Help", level: "A", since: "2.2", c: "S", methods: ["code-review"],
    remarks: "Links to the accessibility statement and to the problem-reporting page appear in the same footer position on every application and documentation page." },
  { sc: "3.3.1", name: "Error Identification", level: "A", since: "2.0", c: "S", methods: ["code-review"],
    remarks: "The few possible input errors (analyzing empty text, importing a file that is not an assessment) are described in text and announced through a live region." },
  { sc: "3.3.2", name: "Labels or Instructions", level: "A", since: "2.0", c: "S", methods: ["automated", "code-review"], remarks: "Every field has a visible label; scoping questions also explain why they are asked." },
  { sc: "3.3.7", name: "Redundant Entry", level: "A", since: "2.2", c: "S", methods: ["code-review"],
    remarks: "Information entered once (product name, organization, scope) is reused automatically in statements and reports; nothing has to be entered twice." },
  { sc: "4.1.1", name: "Parsing (obsolete and removed in WCAG 2.2)", level: "A", since: "2.0", c: "S", methods: ["code-review"],
    remarks: "Removed in WCAG 2.2 and treated as always satisfied. For WCAG 2.0 and 2.1: markup is generated from templates with unique IDs, and the browser DOM is checked by axe-core for duplicate IDs referenced by ARIA." },
  { sc: "4.1.2", name: "Name, Role, Value", level: "A", since: "2.0", c: "S", methods: ["automated", "scripted", "aria-tree"],
    remarks: "Native controls are used throughout. Custom patterns expose correct roles and states: tabs (tablist/tab/tabpanel, aria-selected, roving tabindex), the theme toggle (aria-pressed), the current page (aria-current) and disclosure (details/summary)." },

  // ------------------------------------------------------------ Level AA
  { sc: "1.2.4", name: "Captions (Live)", level: "AA", since: "2.0", c: "NA", methods: ["code-review"], remarks: "The product contains no live audio." },
  { sc: "1.2.5", name: "Audio Description (Prerecorded)", level: "AA", since: "2.0", c: "NA", methods: ["code-review"], remarks: "The product contains no video." },
  { sc: "1.3.4", name: "Orientation", level: "AA", since: "2.1", c: "S", methods: ["code-review", "scripted"], remarks: "No orientation lock; layouts were checked at portrait phone widths (320 px) and desktop widths." },
  { sc: "1.3.5", name: "Identify Input Purpose", level: "AA", since: "2.1", c: "NA", methods: ["code-review"],
    remarks: "No field collects information about the user. Fields describe the product being assessed (name, responsible organization, scope), which is not one of the WCAG input purposes for the user." },
  { sc: "1.4.3", name: "Contrast (Minimum)", level: "AA", since: "2.0", c: "S", methods: ["automated", "visual"],
    remarks: "axe-core contrast checks pass in light and dark themes on every page state. Dark-theme accent colours were changed during evaluation to meet 4.5:1." },
  { sc: "1.4.4", name: "Resize Text", level: "AA", since: "2.0", c: "S", methods: ["scripted", "visual"], remarks: "No loss of content or function at 200% zoom (640 CSS px viewport); text scales with browser zoom." },
  { sc: "1.4.5", name: "Images of Text", level: "AA", since: "2.0", c: "S", methods: ["code-review"], remarks: "No images of text are used." },
  { sc: "1.4.10", name: "Reflow", level: "AA", since: "2.1", c: "S", methods: ["scripted", "visual"],
    remarks: "No two-dimensional scrolling at 320 CSS px on any page state. Data tables in the report scroll within their own container, which WCAG allows for content that needs two-dimensional layout. The header stops being sticky on narrow screens so it does not take space at high zoom." },
  { sc: "1.4.11", name: "Non-text Contrast", level: "AA", since: "2.1", c: "S", methods: ["scripted", "visual"],
    remarks: "Field and choice boundaries have at least 3:1 contrast in both themes, and focus indicators have at least 3:1 against their background (both verified by scripted checks). Field borders were darkened during evaluation." },
  { sc: "1.4.12", name: "Text Spacing", level: "AA", since: "2.1", c: "S", methods: ["scripted"], remarks: "With the WCAG text-spacing overrides applied at 1280 px and 320 px, no content is clipped and no horizontal scrolling appears." },
  { sc: "1.4.13", name: "Content on Hover or Focus", level: "AA", since: "2.1", c: "S", methods: ["code-review"],
    remarks: "No custom hover or focus pop-ups. Some badges have a native title tooltip, which is controlled by the browser." },
  { sc: "2.4.5", name: "Multiple Ways", level: "AA", since: "2.0", c: "S", methods: ["code-review"], remarks: "Main navigation, a family sidebar, previous/next links, and a searchable library of all controls." },
  { sc: "2.4.6", name: "Headings and Labels", level: "AA", since: "2.0", c: "S", methods: ["code-review", "aria-tree"], remarks: "Headings and labels describe their topic or purpose; repeated “Questions” headings include the control ID for assistive technology." },
  { sc: "2.4.7", name: "Focus Visible", level: "AA", since: "2.0", c: "S", methods: ["scripted", "visual"],
    remarks: "Every focus stop on every page state shows an outline (scripted check), including visually hidden radio and file inputs, whose indicator appears on their visible label, and the date input's calendar button." },
  { sc: "2.4.11", name: "Focus Not Obscured (Minimum)", level: "AA", since: "2.2", c: "S", methods: ["scripted", "code-review"],
    remarks: "Scroll padding keeps focused elements clear of the sticky header and of the confirmation message, which can also be dismissed with Escape. The scripted check confirms no focused element is hidden on any page state, including one with the message showing." },
  { sc: "2.5.7", name: "Dragging Movements", level: "AA", since: "2.2", c: "NA", methods: ["code-review"], remarks: "No dragging is required. (Text area resize handles are provided by the browser.)" },
  { sc: "2.5.8", name: "Target Size (Minimum)", level: "AA", since: "2.2", c: "S", methods: ["scripted"],
    remarks: "Every pointer target is at least 24 by 24 CSS px, except links inside sentences, which WCAG exempts (scripted check). The skip link and footer links were enlarged during evaluation." },
  { sc: "3.1.2", name: "Language of Parts", level: "AA", since: "2.0", c: "S", methods: ["code-review"],
    remarks: "All product text is English. Text that users type (for example French notes) is shown as entered without a language tag, because the product cannot know its language." },
  { sc: "3.2.3", name: "Consistent Navigation", level: "AA", since: "2.0", c: "S", methods: ["code-review"], remarks: "The header navigation and footer are identical and in the same order on every view." },
  { sc: "3.2.4", name: "Consistent Identification", level: "AA", since: "2.0", c: "S", methods: ["code-review"], remarks: "Components with the same function use the same labels throughout (e.g. status and applicability badges, export buttons)." },
  { sc: "3.3.3", name: "Error Suggestion", level: "AA", since: "2.0", c: "S", methods: ["code-review"], remarks: "Error messages say how to fix the problem (e.g. “Paste some documentation text first”)." },
  { sc: "3.3.4", name: "Error Prevention (Legal, Financial, Data)", level: "AA", since: "2.0", c: "S", methods: ["code-review"],
    remarks: "Actions that delete or replace the user's data (start over, load sample, replace an implementation statement) ask for confirmation, and the assessment can be exported and re-imported." },
  { sc: "3.3.8", name: "Accessible Authentication (Minimum)", level: "AA", since: "2.2", c: "NA", methods: ["code-review"], remarks: "The product has no authentication." },
  { sc: "4.1.3", name: "Status Messages", level: "AA", since: "2.1", c: "S", methods: ["scripted", "code-review"],
    remarks: "Results of actions (answer status, scope changes, analysis results, search result counts, import and export confirmations, errors) are announced through a polite live region without moving focus (scripted check)." },
];

// EN 301 549 v3.2.1 clauses other than chapter 9. Chapter 9 (web) is derived
// automatically from the WCAG 2.1 results above.
export const EN_FPS = [
  { id: "4.2.1", name: "Usage without vision", c: "S", remarks: "Supported through conformance to the WCAG criteria in chapter 9: all content and functions are exposed through native semantics, and the generated accessibility tree snapshots confirm names, roles and states. Not yet verified with screen reader users (see Notes)." },
  { id: "4.2.2", name: "Usage with limited vision", c: "S", remarks: "Supports browser zoom to 400% without loss of content, meets contrast minimums in light and dark themes, follows the operating system's dark mode, and supports Windows forced-colours mode." },
  { id: "4.2.3", name: "Usage without perception of colour", c: "S", remarks: "Colour is never the only way information is conveyed (see 9.1.4.1)." },
  { id: "4.2.4", name: "Usage without hearing", c: "NA", remarks: "The product does not use audio." },
  { id: "4.2.5", name: "Usage with limited hearing", c: "NA", remarks: "The product does not use audio." },
  { id: "4.2.6", name: "Usage with no or limited vocal capability", c: "NA", remarks: "The product does not require speech input." },
  { id: "4.2.7", name: "Usage with limited manipulation or strength", c: "S", remarks: "Fully keyboard operable, with no gestures, dragging or time limits, and targets of at least 24 by 24 CSS px." },
  { id: "4.2.8", name: "Usage with limited reach", c: "NA", remarks: "Software only; there are no physical controls." },
  { id: "4.2.9", name: "Minimize photosensitive seizure triggers", c: "S", remarks: "No flashing content; motion is removed when the user prefers reduced motion." },
  { id: "4.2.10", name: "Usage with limited cognition, language or learning", c: "P",
    remarks: "Plain-language questions, a “why we ask” explanation for each scoping question, consistent navigation, no time limits, confirmation before data loss, and progress shown at each step. However, the subject matter (ITSG-33 security controls) is technical, and the product uses specialized terms and acronyms that some users will find hard to understand; a glossary is not yet provided." },
  { id: "4.2.11", name: "Privacy", c: "S", remarks: "Accessibility features do not expose personal information. Assessment data stays in the user's browser." },
];

export const EN_OTHER = [
  { chapter: "5", id: "5.1", name: "Closed functionality", c: "NA", remarks: "The product is a web application used with the user's own browser and assistive technology." },
  { chapter: "5", id: "5.2", name: "Activation of accessibility features", c: "NA", remarks: "The product has no platform accessibility features to activate. It follows the user's dark mode, reduced motion and forced-colours settings automatically." },
  { chapter: "5", id: "5.3", name: "Biometrics", c: "NA", remarks: "Not used." },
  { chapter: "5", id: "5.4", name: "Preservation of accessibility information during conversion", c: "S", remarks: "Report exports keep structure: Markdown keeps headings, lists and tables, and CSV has a header row. Printing uses the browser's PDF output (see chapter 10)." },
  { chapter: "5", id: "5.5–5.8", name: "Operable parts, locking, key repeat, double-strike", c: "NA", remarks: "Hardware-related; not applicable to a web application." },
  { chapter: "5", id: "5.9", name: "Simultaneous user actions", c: "S", remarks: "No function requires simultaneous actions." },
  { chapter: "6", id: "6", name: "ICT with two-way voice communication", c: "NA", remarks: "Not provided." },
  { chapter: "7", id: "7", name: "ICT with video capabilities", c: "NA", remarks: "Not provided." },
  { chapter: "8", id: "8", name: "Hardware", c: "NA", remarks: "Software only." },
  { chapter: "10", id: "10", name: "Non-web documents", c: "NE",
    remarks: "Files the product produces (Markdown and CSV reports, JSON assessment exports, and PDFs produced with the browser's print function) have not been evaluated as non-web documents. Markdown and CSV are plain text with structure. Whether a printed PDF is tagged depends on the browser." },
  { chapter: "11", id: "11.1–11.7", name: "Software (non-web)", c: "NA", remarks: "Web application, evaluated under chapter 9." },
  { chapter: "11", id: "11.8.1", name: "Authoring tools: content technology", c: "S", remarks: "The product generates an HTML report; the generated report view is included in every automated test run." },
  { chapter: "11", id: "11.8.2", name: "Authoring tools: accessible content creation", c: "S", remarks: "Users supply only plain text. The report structure (headings, captioned tables, lists) is produced by the product, and user text is escaped, so users cannot introduce inaccessible markup." },
  { chapter: "11", id: "11.8.3", name: "Authoring tools: preservation of accessibility information in transformations", c: "S", remarks: "The Markdown export keeps the report's headings, lists and tables." },
  { chapter: "11", id: "11.8.4", name: "Authoring tools: repair assistance", c: "NA", remarks: "Users cannot author markup, so there is nothing to repair." },
  { chapter: "11", id: "11.8.5", name: "Authoring tools: templates", c: "NA", remarks: "No layout templates are offered. Draft implementation statements are plain text." },
  { chapter: "12", id: "12.1.1", name: "Accessibility and compatibility features", c: "S", remarks: "The accessibility statement (accessibility/index.html) describes the accessibility features, supported settings and known limitations." },
  { chapter: "12", id: "12.1.2", name: "Accessible documentation", c: "S", remarks: "Documentation is provided as HTML pages that are included in the automated test runs, plus Markdown." },
  { chapter: "12", id: "12.2.2–12.2.4", name: "Support services", c: "NA", remarks: "No support service is offered. Accessibility problems can be reported through the project's issue tracker." },
];

// Map an automated scripted check id to a short description for remarks.
export const METHOD_LABELS = {
  automated: "axe-core rules",
  scripted: "scripted Playwright checks",
  "code-review": "code review",
  visual: "visual inspection",
  "aria-tree": "accessibility tree inspection",
};
