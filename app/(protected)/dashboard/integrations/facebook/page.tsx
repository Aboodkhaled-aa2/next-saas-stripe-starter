import Link from "next/link";
import { CheckCircle2, Facebook, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function FacebookIntegrationPage() {
  const user = await getCurrentUser();
  const connection = user?.id ? await prisma.metaIntegration.findFirst({
    where: { userId: user.id, platform: "FACEBOOK" },
    select: { pageName: true, pageId: true },
  }) : null;

  return (
    <div className="space-y-6">
      <DashboardHeader heading="Facebook" text="Connect your Facebook Page so Smart Cleaning Desk can handle customer conversations." />
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="flex flex-col gap-5 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold text-white">Facebook Page</h2><p className="mt-1 text-sm leading-6 text-slate-500">Connect the customer's own Facebook Page through Meta Login for Business.</p></div>
          {connection ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" />Connected{connection.pageName ? `: ${connection.pageName}` : ""}</div>
          ) : (
            <Link href="/api/integrations/meta/facebook/start" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"><Facebook className="h-4 w-4" />Connect Facebook</Link>
          )}
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <FeatureCard icon={<MessageCircle className="h-4 w-4" />} title="AI Replies" text="Handle eligible customer conversations with your Smart Cleaning Desk AI." />
          <FeatureCard icon={<Sparkles className="h-4 w-4" />} title="Lead Capture" text="Keep customer conversations connected to your business workflow." />
          <FeatureCard icon={<Zap className="h-4 w-4" />} title="Unified Inbox" text="Bring Facebook conversations into the same customer workflow." />
        </div>
        {connection && <div className="border-t border-slate-800 bg-slate-900/20 p-6 text-sm text-slate-400">Page ID: {connection.pageId || "Connected"}</div>}
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Secure Connection" text="Meta credentials are stored server-side and are not exposed to the browser." />
        <InfoCard icon={<CheckCircle2 className="h-5 w-5" />} title="Customer-Owned Assets" text="Each cleaning company connects its own Page rather than using Smart Cleaning Desk's business assets." />
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
