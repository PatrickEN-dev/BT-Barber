/**
 * Current terms version. Bump this when the legal pages
 * (/termos, /privacidade, /cancelamento) change in a material way that
 * requires re-acceptance from existing users — the TermsGate compares this
 * against `User.termsVersion` and re-prompts if they differ.
 *
 * Use semver-ish strings ("1.0", "1.1", "2.0"). Patch bumps (typo fixes,
 * formatting) shouldn't trigger re-acceptance — keep the same minor version.
 */
export const TERMS_VERSION = "1.0";

export const isCurrentTermsVersion = (version: string | null | undefined) =>
  version === TERMS_VERSION;
