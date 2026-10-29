export function createTrialWindow(now?: Date): {
  startedAt: Date;
  endsAt: Date;
};

export function isTrialActive(
  trialEndsAt: Date | null | undefined,
  now?: Date,
  hasStripeSubscription?: boolean,
): boolean;
