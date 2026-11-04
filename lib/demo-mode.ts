export const isDemoMode = process.env.DEMO_MODE === "true";

export function demoPaymentsDisabledResponse() {
  return Response.json(
    { error: "Payments are disabled in Demo mode.", code: "DEMO_PAYMENTS_DISABLED" },
    { status: 403 },
  );
}
