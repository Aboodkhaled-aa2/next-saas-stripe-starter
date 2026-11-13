const AI_PHONE_TRIAL_TEST_EMAIL = "aboodkhaled1177@gmail.com";

/**
 * Temporary allowlist for the dedicated AI Phone trial test account.
 * This grants AI Phone access only; it does not grant admin privileges.
 */
export function isAIPhoneTrialTester(email: string | null | undefined): boolean {
  return email?.trim().toLowerCase() === AI_PHONE_TRIAL_TEST_EMAIL;
}
