import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function UpgradeCard() {
  return (
    <Card className="border-slate-800 bg-slate-950/70 text-white shadow-lg md:max-xl:rounded-none md:max-xl:border-none">
      <CardContent className="p-4">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
          <Sparkles className="h-4 w-4 text-blue-400" />
        </div>

        <h3 className="text-sm font-semibold text-white">
          Upgrade to Pro
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Unlock advanced AI features, more voice minutes, and powerful
          automation for your cleaning business.
        </p>

        <Button
          size="sm"
          className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-500"
        >
          Upgrade
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
