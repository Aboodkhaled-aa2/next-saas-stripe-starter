import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function UpgradeCard() {
  return (
    <Card className="border-[#172746] bg-[#080f21] text-white shadow-none md:max-xl:rounded-none md:max-xl:border-none">
      <CardContent className="p-4">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1938]">
          <Sparkles className="h-4 w-4 text-[#60a5fa]" />
        </div>

        <h3 className="text-sm font-semibold">
          Upgrade to Pro
        </h3>

        <p className="mt-2 text-xs leading-5 text-[#64748b]">
          Unlock advanced AI features and more voice minutes for your
          cleaning business.
        </p>

        <Button
          size="sm"
          className="mt-4 w-full bg-[#2563eb] text-white hover:bg-[#3b82f6]"
        >
          Upgrade
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
