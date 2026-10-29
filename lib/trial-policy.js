function createTrialWindow(now = new Date()) {
  const startedAt = new Date(now.getTime());
  const endsAt = new Date(startedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { startedAt, endsAt };
}

function isTrialActive(trialEndsAt, now = new Date(), hasStripeSubscription = false) {
  return !hasStripeSubscription && trialEndsAt instanceof Date && trialEndsAt.getTime() > now.getTime();
}

module.exports = { createTrialWindow, isTrialActive };
