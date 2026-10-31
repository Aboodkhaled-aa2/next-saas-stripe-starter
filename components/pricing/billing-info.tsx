import Link from "next/link";
import * as React from "react";

import { CustomerPortalButton } from "@/components/forms/customer-portal-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { UserSubscriptionPlan } from "types";

interface BillingInfoProps extends React.HTMLAttributes<HTMLDivElement> {
  userSubscriptionPlan: UserSubscriptionPlan;
}

function formatPrice(amount: number, interval: "month" | "year" | null) {
  if (!interval) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount) + (interval === "month" ? " / month" : " / year");
}

export function BillingInfo({ userSubscriptionPlan }: BillingInfoProps) {
  const {
    title,
    description,
    stripeCustomerId,
    isPaid,
    isTrial,
    isCanceled,
    stripeCurrentPeriodEnd,
    trialEndsAt,
    interval,
    prices,
  } = userSubscriptionPlan;

  const currentPrice =
    interval === "year" ? prices.yearly : interval === "month" ? prices.monthly : null;

  const statusLabel = isPaid
    ? isCanceled
      ? "Cancels at period end"
      : "Active subscription"
    : isTrial
      ? "Free trial"
      : "No active subscription";

  const statusClass = isPaid
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    : isTrial
      ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-300";

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden border-slate-800 bg-slate-950 text-white shadow-xl">
        <CardHeader className="space-y-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl font-semibold text-white">
              Subscription
            </CardTitle>
            <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusClass)}>
              {statusLabel}
            </span>
          </div>
          <div className="space-y-2">
            <CardDescription className="text-sm text-slate-400">
              Your current Smart Cleaning Desk plan
            </CardDescription>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
              {currentPrice !== null ? (
                <span className="pb-1 text-sm font-medium text-slate-300">
                  {formatPrice(currentPrice, interval)}
                </span>
              ) : null}
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 border-t border-slate-800 px-6 py-5 sm:grid-cols-2 sm:px-8">
          {isPaid ? (
            <>
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {isCanceled ? "Access ends on" : "Next billing date"}
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {formatDate(stripeCurrentPeriodEnd)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Billing interval
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {interval === "year" ? "Annual billing" : "Monthly billing"}
                </p>
              </div>
            </>
          ) : isTrial && trialEndsAt ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Free trial ends
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {formatDate(trialEndsAt.getTime())}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Add a subscription before the trial ends to keep using all available features.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 sm:col-span-2">
              <p className="text-sm text-slate-300">
                Choose a subscription plan to unlock your business workspace.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-3 border-t border-slate-800 bg-slate-900/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs leading-5 text-slate-400">
            {isPaid
              ? "Manage your payment method, invoices, plan changes, and cancellation securely with Stripe."
              : isTrial
                ? "Your trial does not require a payment method. You can subscribe at any time."
                : "Select a plan to activate your subscription."}
          </p>
          {isPaid && stripeCustomerId ? (
            <CustomerPortalButton userStripeId={stripeCustomerId} />
          ) : (
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              {isTrial ? "Choose a plan" : "View plans"}
            </Link>
          )}
        </CardFooter>
      </Card>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6">
        <h3 className="font-semibold text-white">Billing support</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Need help with a charge or subscription? Contact our support team and include the email address on your account.
        </p>
        <a
          href="mailto:supportsmartcleaningdesk@gmail.com"
          className="mt-3 inline-flex text-sm font-medium text-sky-400 transition-colors hover:text-sky-300"
        >
          supportsmartcleaningdesk@gmail.com
        </a>
      </div>
    </div>
  );
}
