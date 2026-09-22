import { Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InfoCard() {
  return (
    <Card className="border-slate-800 bg-slate-950/70 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">
          Active Leads
        </CardTitle>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
          <Users className="h-4 w-4 text-blue-400" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-white">
          +24
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Leads captured this month
        </p>
      </CardContent>
    </Card>
  );
}
