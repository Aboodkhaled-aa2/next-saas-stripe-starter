const test = require("node:test");
const assert = require("node:assert/strict");
const { createTrialWindow, isTrialActive } = require("../lib/trial-policy.js");

test("new account receives a seven-day UTC trial window", () => {
  const now = new Date("2026-10-29T12:00:00.000Z");
  const trial = createTrialWindow(now);
  assert.equal(trial.startedAt.toISOString(), "2026-10-29T12:00:00.000Z");
  assert.equal(trial.endsAt.toISOString(), "2026-11-05T12:00:00.000Z");
  assert.equal(isTrialActive(trial.endsAt, now, false), true);
});

test("a used trial is not active after its end date", () => {
  const now = new Date("2026-11-06T12:00:00.000Z");
  const pastEnd = new Date("2026-11-05T12:00:00.000Z");
  assert.equal(isTrialActive(pastEnd, now, false), false);
});

test("missing trial end date is not silently treated as a new trial", () => {
  assert.equal(isTrialActive(null, new Date("2026-10-29T12:00:00.000Z"), false), false);
});

test("a Stripe subscription prevents the account being classified as trialing", () => {
  const now = new Date("2026-10-29T12:00:00.000Z");
  const futureEnd = new Date("2026-11-05T12:00:00.000Z");
  assert.equal(isTrialActive(futureEnd, now, true), false);
});
