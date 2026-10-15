// Scoping interview. Each answer shapes which controls apply, which are
// inherited from a provider and which are not applicable. The "why" text is
// shown to the user so they understand what the question changes.

export const PROFILE_FIELDS = [
  { id: "productName", type: "text", label: "Product or system name", placeholder: "e.g. CaseTrack Online",
    why: "Used throughout the report and in the draft implementation statements." },
  { id: "org", type: "text", label: "Responsible organization", placeholder: "e.g. Acme Software Inc. / Department X",
    why: "The party that operates the product and owns its controls. Used in implementation statements." },
  { id: "description", type: "textarea", label: "What does the product do?", placeholder: "Business purpose, users, the information it handles...",
    why: "A one-paragraph system description is the first thing an assessor reads in a System Security Plan (PL-2)." },

  { id: "classification", type: "choice", label: "Highest sensitivity of information processed", default: "pb",
    why: "ITSG-33's PBMM profile is built for Protected B, Medium integrity, Medium availability. Protected C or classified information needs a stronger profile.",
    options: [
      { value: "unclassified", label: "Unclassified" },
      { value: "pa", label: "Protected A" },
      { value: "pb", label: "Protected B" },
      { value: "pc", label: "Protected C or classified" },
    ] },
  { id: "integrity", type: "choice", label: "Integrity needs (injury if information is altered)", default: "medium",
    why: "PBMM assumes medium integrity. High integrity needs (e.g. payments, legal records) push you beyond this baseline.",
    options: [
      { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" },
    ] },
  { id: "availability", type: "choice", label: "Availability needs (injury if unavailable)", default: "medium",
    why: "Drives contingency planning (CP) depth. High availability needs alternate sites and tested failover.",
    options: [
      { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" },
    ] },

  { id: "operator", type: "choice", label: "Who operates the product day to day?", default: "vendor",
    why: "If a vendor operates it (SaaS), many operational controls become the vendor's to evidence and yours to verify.",
    options: [
      { value: "vendor", label: "Vendor operates it (SaaS / managed service)" },
      { value: "department", label: "We operate it ourselves" },
    ] },
  { id: "hosting", type: "choice", label: "Where does it run?", default: "gc-csp",
    why: "Hosting in a cloud service assessed by the Canadian Centre for Cyber Security lets you inherit most physical, environmental and media controls.",
    options: [
      { value: "gc-csp", label: "Public cloud, CCCS-assessed, Canadian region" },
      { value: "other-cloud", label: "Other cloud (not assessed, or outside Canada)" },
      { value: "gc-dc", label: "Government / departmental data centre" },
      { value: "vendor-dc", label: "Vendor's own data centre" },
      { value: "endpoint", label: "Installed on end-user devices only" },
    ] },
  { id: "identity", type: "choice", label: "How do users sign in?", default: "gc-sso",
    why: "Federating to the departmental identity provider removes most password, lockout and account-lifecycle requirements from the product.",
    options: [
      { value: "gc-sso", label: "Federated single sign-on (SAML / OIDC to departmental IdP)" },
      { value: "local", label: "Product's own usernames and passwords" },
      { value: "mixed", label: "Both: SSO for staff, local accounts for others" },
      { value: "none", label: "No interactive users (service / batch only)" },
    ] },
  { id: "userBase", type: "choice", label: "Who uses it?", default: "internal",
    why: "Non-organizational users (public, partners) bring in IA-8 and affect identity assurance and privacy obligations.",
    options: [
      { value: "internal", label: "Government staff only" },
      { value: "external", label: "Public or partners only" },
      { value: "both", label: "Both staff and external users" },
    ] },
  { id: "development", type: "choice", label: "Who builds the software?", default: "vendor-cots",
    why: "In-house developers must meet secure development controls directly; for vendor products you collect evidence instead.",
    options: [
      { value: "in-house", label: "We develop it" },
      { value: "vendor-custom", label: "Vendor builds it to our requirements" },
      { value: "vendor-cots", label: "Commercial off-the-shelf / SaaS" },
      { value: "open-source", label: "Open source we deploy" },
    ] },

  { id: "internetFacing", type: "yesno", label: "Is any part reachable from the internet?", default: "yes",
    why: "Internet exposure raises the importance of boundary protection, DoS protection and vulnerability management." },
  { id: "publicContent", type: "yesno", label: "Does it publish information to the public?", default: "no",
    why: "Publicly accessible content triggers AC-22: someone must check nothing sensitive gets published." },
  { id: "interconnections", type: "yesno", label: "Does it exchange data with other systems (APIs, feeds, integrations)?", default: "yes",
    why: "Each interconnection needs an agreement and controlled information flow (CA-3, AC-4)." },
  { id: "remoteMaintenance", type: "yesno", label: "Does vendor support connect remotely for maintenance?", default: "yes",
    why: "Remote maintenance (MA-4) is a frequent path for compromise and needs strong authentication and session oversight." },
  { id: "wireless", type: "yesno", label: "Does the product include or depend on wireless networks you manage?", default: "no",
    why: "If not, wireless access controls (AC-18) are not applicable to the product." },
  { id: "mobile", type: "yesno", label: "Is there a mobile app or mobile-device access?", default: "no",
    why: "Mobile access brings in AC-19 and device management expectations." },
  { id: "removableMedia", type: "yesno", label: "Is information ever exported to removable media (USB, disks, tapes)?", default: "no",
    why: "If information never leaves on media, most media protection controls fall to the hosting provider." },
];

export const PROFILE_DEFAULTS = Object.fromEntries(
  PROFILE_FIELDS.map((f) => [f.id, f.default ?? ""]),
);

export const PROFILE_LABELS = Object.fromEntries(
  PROFILE_FIELDS.filter((f) => f.options).map((f) => [
    f.id, Object.fromEntries(f.options.map((o) => [o.value, o.label])),
  ]),
);

export function profileLabel(profile, field) {
  const value = profile[field];
  if (PROFILE_LABELS[field]) return PROFILE_LABELS[field][value] ?? value;
  const def = PROFILE_FIELDS.find((f) => f.id === field);
  if (def?.type === "yesno") return value === "yes" ? "Yes" : "No";
  return value;
}

// Warnings raised by the profile itself, before any control is looked at.
export function profileWarnings(profile) {
  const w = [];
  if (profile.classification === "pc")
    w.push("Protected C or classified information is outside the PBMM profile. Engage your departmental security team for a higher-assurance profile; this tool's results will understate requirements.");
  if (profile.integrity === "high" || profile.availability === "high")
    w.push("High integrity or availability needs exceed the PBMM baseline. Expect additional control enhancements, especially in CP, SI and SC.");
  if (profile.hosting === "other-cloud" && ["pa", "pb"].includes(profile.classification))
    w.push("Protected information in a cloud that is not CCCS-assessed or not in Canada conflicts with GC data residency expectations. Inherited controls cannot be relied on without the provider's evidence.");
  if (profile.identity === "local")
    w.push("Local product accounts keep the full identity lifecycle (passwords, lockout, MFA, account reviews) in scope. Federating to the departmental IdP is the single biggest scope reduction available.");
  return w;
}
