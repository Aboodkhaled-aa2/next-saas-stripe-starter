import Link from "next/link";
import { CheckCircle2, Instagram, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { InstagramDisconnectButton } from "@/components/dashboard/instagram-disconnect-button";

export const dynamic = "force-dynamic";

export default async function InstagramIntegrationPage() {
  const user = await getCurrentUser();
  const connection = user?.id ? await prisma.metaIntegration.findFirst({
    where: { userId: user.id, platform: "INSTAGRAM" },
    select: { externalAccountName: true, instagramAccountId: true },
  }) : null;

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Instagram" text="Connect a professional Instagram account directly through Instagram Business Login." />
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="flex flex-col gap-5 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold text-white">Instagram Business</h2><p className="mt-1 text-sm leading-6 text-slate-500">The customer connects their own Instagram Business or Creator account.</p></div>
          {connection ? (
            <div className="flex flex-wrap items-center gap-3"><div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" />Connected{connection.externalAccountName ? `: @${connection.externalAccountName}` : ""}</div><InstagramDisconnectButton /></div>
          ) : (
            <Link href="/api/integrations/meta/instagram/start" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-pink-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-pink-500"><Instagram className="h-4 w-4" />Connect Instagram</Link>
          )}
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <FeatureCard icon={<MessageCircle className="h-4 w-4" />} title="AI Replies" text="Handle eligible Instagram conversations with your AI employee." />
          <FeatureCard icon={<Sparkles className="h-4 w-4" />} title="Lead Capture" text="Keep incoming customer conversations connected to leads." />
          <FeatureCard icon={<Zap className="h-4 w-4" />} title="Comment Management" text="Support Instagram comment workflows when the required Meta access is approved." />
        </div>
        {connection && <div className="border-t border-slate-800 bg-slate-900/20 p-6 text-sm text-slate-400">Instagram account ID: {connection.instagramAccountId || "Connected"}</div>}
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Secure Connection" text="The long-lived Instagram access token is stored server-side." />
        <InfoCard icon={<CheckCircle2 className="h-5 w-5" />} title="No Facebook Page Required" text="This flow uses Instagram Business Login and does not depend on the customer's Facebook Page." />
      </section>
    </div>
  );
}
function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400">{icon}</div><h3 className="mt-4 text-sm font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div>;
}
function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl"><div className="flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">{icon}</div><div><h3 className="font-medium text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div></div></div>;
}
