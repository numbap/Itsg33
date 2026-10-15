// Sample product used by "Load sample product" and by the accessibility test fixtures.

import { newState } from "./engine.js";

export const SAMPLE_TEXT = `CaseTrack Online is a software as a service case management product hosted in Microsoft Azure Canada Central with backups replicated to Canada East.
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

export function sampleState() {
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

