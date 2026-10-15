// Where and how the assessment is kept in this browser. No DOM access, so it
// can be unit-tested with an in-memory storage object.
//
// Modes:
//   encrypted  AES-256-GCM ciphertext in localStorage; passphrase required to unlock
//   memory     nothing written to disk; work is lost when the tab closes
//   plain      unencrypted JSON in localStorage; allowed only for Unclassified
//
// Rule enforced here, not only in the UI: Protected A or B assessments are never
// written to browser storage unencrypted.

import { createKey, isEnvelope, open, seal, passphraseProblem } from "./vault.js";

export const KEYS = {
  settings: "itsg33-navigator-settings",
  vault: "itsg33-navigator-vault",
  plain: "itsg33-navigator-state",
  theme: "itsg33-theme",
};

export const MARKINGS = {
  unclassified: { label: "Unclassified", banner: "UNCLASSIFIED", protected: false },
  pa: { label: "Protected A", banner: "PROTECTED A", protected: true },
  pb: { label: "Protected B", banner: "PROTECTED B", protected: true },
};

export const MODES = {
  encrypted: { label: "Encrypted in this browser", short: "Encrypted" },
  memory: { label: "Not saved (this tab only)", short: "Not saved" },
  plain: { label: "Unencrypted in this browser (Unclassified only)", short: "Unencrypted" },
};

// Auto-lock after inactivity. Adjustable from 15 minutes to 8 hours or off, so the
// time limit can be extended well beyond ten times the default (WCAG 2.2.1).
export const LOCK_OPTIONS = [15, 30, 60, 120, 240, 480, 0];
export const DEFAULT_SETTINGS = { mode: "encrypted", marking: "pb", lockMinutes: 15 };

export class PolicyError extends Error {
  constructor(msg, field) { super(msg); this.name = "PolicyError"; this.field = field; }
}

export function modeAllowed(mode, marking) {
  return mode !== "plain" || !MARKINGS[marking]?.protected;
}

export class Store {
  constructor(storage) {
    this.storage = storage;
    this.key = null;            // derived AES key while unlocked
    this.writing = Promise.resolve();
    this.available = this.#probe();
    this.settings = this.#read(KEYS.settings);
    if (this.settings && !this.available) this.settings = { ...this.settings, mode: "memory" };
  }

  #probe() {
    try {
      const k = "itsg33-navigator-probe";
      this.storage.setItem(k, "1");
      this.storage.removeItem(k);
      return true;
    } catch { return false; }
  }

  #read(k) {
    try { const raw = this.storage.getItem(k); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  #write(k, v) {
    if (!this.available) return;
    this.storage.setItem(k, JSON.stringify(v));
  }

  #remove(k) {
    try { this.storage.removeItem(k); } catch { /* ignore */ }
  }

  // "setup": no choice made yet; "locked": encrypted data awaiting passphrase; "ready".
  status() {
    if (!this.settings) return "setup";
    if (this.settings.mode === "encrypted" && !this.key) return this.#read(KEYS.vault) ? "locked" : "setup";
    return "ready";
  }

  hasLegacyPlain() {
    return !this.settings && !!this.#read(KEYS.plain);
  }

  // Unencrypted data from before storage modes existed, offered for migration.
  legacyState() {
    return this.#read(KEYS.plain);
  }

  // Loads the state for plain or memory mode (encrypted mode uses unlock()).
  loadReady() {
    return this.settings?.mode === "plain" ? this.#read(KEYS.plain) : null;
  }

  async setup({ mode, marking, lockMinutes = DEFAULT_SETTINGS.lockMinutes, passphrase, confirm, state }) {
    if (!MODES[mode]) throw new PolicyError("Choose how to keep your work.", "mode");
    if (!MARKINGS[marking]) throw new PolicyError("Choose a security marking.", "marking");
    if (!modeAllowed(mode, marking)) throw new PolicyError(`${MARKINGS[marking].label} information cannot be stored unencrypted. Choose encrypted storage or do not save.`, "mode");
    if (mode !== "memory" && !this.available) throw new PolicyError("This browser does not allow storage (for example, a private window). Choose “Not saved”.", "mode");
    if (mode === "encrypted") {
      const problem = passphraseProblem(passphrase, confirm);
      if (problem) throw new PolicyError(problem, "passphrase");
      this.key = await createKey(passphrase);
    } else {
      this.key = null;
    }
    this.settings = { mode, marking, lockMinutes };
    this.#write(KEYS.settings, this.settings);
    this.#remove(KEYS.vault);
    if (mode !== "plain") this.#remove(KEYS.plain);
    if (state) await this.save(state);
  }

  async unlock(passphrase) {
    const env = this.#read(KEYS.vault);
    if (!env) throw new PolicyError("No encrypted assessment found.", "passphrase");
    const { data, key } = await open(passphrase, env);
    this.key = key;
    return data;
  }

  lock() {
    this.key = null;
  }

  // Writes are serialized so an older encryption cannot overwrite a newer one.
  save(state) {
    const settings = this.settings;
    if (!settings || settings.mode === "memory") return this.writing;
    this.writing = this.writing.then(async () => {
      if (settings.mode === "plain") {
        if (!modeAllowed("plain", settings.marking)) throw new PolicyError("Refusing to store protected information unencrypted.", "mode");
        this.#write(KEYS.plain, state);
      } else if (this.key) {
        this.#write(KEYS.vault, await seal(this.key, state, settings.marking));
      }
    }).catch((e) => { this.lastError = e; });
    return this.writing;
  }

  async changeMode(mode, { passphrase, confirm, state }) {
    await this.setup({ mode, marking: this.settings.marking, lockMinutes: this.settings.lockMinutes, passphrase, confirm, state });
  }

  async changePassphrase(passphrase, confirm, state) {
    if (this.settings?.mode !== "encrypted") throw new PolicyError("Encrypted storage is not in use.", "passphrase");
    const problem = passphraseProblem(passphrase, confirm);
    if (problem) throw new PolicyError(problem, "passphrase");
    this.key = await createKey(passphrase);
    await this.save(state);
  }

  setMarking(marking) {
    if (!MARKINGS[marking]) throw new PolicyError("Choose a security marking.", "marking");
    if (!modeAllowed(this.settings.mode, marking)) throw new PolicyError(`${MARKINGS[marking].label} information cannot be stored unencrypted. Switch to encrypted storage first.`, "marking");
    this.settings = { ...this.settings, marking };
    this.#write(KEYS.settings, this.settings);
  }

  setLockMinutes(min) {
    if (!LOCK_OPTIONS.includes(min)) throw new PolicyError("Choose an auto-lock time.", "lock");
    this.settings = { ...this.settings, lockMinutes: min };
    this.#write(KEYS.settings, this.settings);
  }

  // Removes everything this application stores in the browser.
  eraseAll() {
    for (const k of Object.values(KEYS)) this.#remove(k);
    this.key = null;
    this.settings = null;
  }

  // Encrypted export uses its own passphrase so files can be shared without
  // revealing the browser passphrase.
  async exportEncrypted(state, passphrase, confirm) {
    const problem = passphraseProblem(passphrase, confirm);
    if (problem) throw new PolicyError(problem, "export-passphrase");
    return seal(await createKey(passphrase), state, this.settings?.marking ?? null);
  }

  async importFile(text, passphrase) {
    let parsed;
    try { parsed = JSON.parse(text); } catch { throw new PolicyError("This file is not an assessment export.", "import-file"); }
    if (isEnvelope(parsed)) {
      if (!passphrase) throw new PolicyError("This file is encrypted. Enter its passphrase.", "import-passphrase");
      try { return { state: (await open(passphrase, parsed)).data, marking: parsed.marking }; } catch (e) {
        throw new PolicyError(e.name === "WrongPassphraseError" ? "Incorrect passphrase for this file." : e.message, "import-passphrase");
      }
    }
    if (!parsed.profile || !parsed.answers) throw new PolicyError("This file is not an assessment export.", "import-file");
    return { state: parsed, marking: null };
  }
}
