import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionsList() {
  return (
    <Card className="border-slate-800 bg-slate-950/70 text-white shadow-lg xl:col-span-2">
      <CardHeader className="flex flex-row items-center border-b border-slate-800/80 pb-5">
        <div className="grid gap-1.5">
          <CardTitle className="text-base font-semibold text-white">
            Transactions
          </CardTitle>

          <CardDescription className="text-sm text-slate-500">
            Recent transactions from your store.
          </CardDescription>
        </div>

        <Button
          size="sm"
          className="ml-auto shrink-0 gap-1 bg-blue-600 px-4 text-white hover:bg-blue-500"
        >
          <Link href="#" className="flex items-center gap-2">
            <span>View All</span>
            <ArrowUpRight className="hidden size-4 sm:block" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="h-11 text-xs font-medium uppercase tracking-wide text-slate-500">
                Customer
              </TableHead>

              <TableHead className="hidden h-11 text-xs font-medium uppercase tracking-wide text-slate-500 xl:table-column">
                Type
              </TableHead>

              <TableHead className="hidden h-11 text-xs font-medium uppercase tracking-wide text-slate-500 xl:table-column">
                Status
              </TableHead>

              <TableHead className="hidden h-11 text-xs font-medium uppercase tracking-wide text-slate-500 md:table-cell lg:hidden xl:table-column">
                Date
              </TableHead>

              <TableHead className="h-11 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow className="border-slate-800/70 hover:bg-slate-900/50">
              <TableCell className="py-4">
                <div className="font-medium text-white">Liam Johnson</div>
                <div className="hidden text-sm text-slate-500 md:inline">
                  liam@example.com
                </div>
              </TableCell>

              <TableCell className="hidden text-slate-400 xl:table-column">
                Sale
              </TableCell>

              <TableCell className="hidden xl:table-column">
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/10">
                  Approved
                </Badge>
              </TableCell>

              <TableCell className="hidden text-slate-400 md:table-cell lg:hidden xl:table-column">
                2023-06-23
              </TableCell>

              <TableCell className="text-right font-medium text-white">
                $250.00
              </TableCell>
            </TableRow>

            <TableRow className="border-slate-800/70 hover:bg-slate-900/50">
              <TableCell className="py-4">
                <div className="font-medium text-white">Olivia Smith</div>
                <div className="hidden text-sm text-slate-500 md:inline">
                  olivia@example.com
                </div>
              </TableCell>

              <TableCell className="hidden text-slate-400 xl:table-column">
                Refund
              </TableCell>

              <TableCell className="hidden xl:table-column">
                <Badge className="border-red-500/20 bg-red-500/10 text-xs text-red-400 hover:bg-red-500/10">
                  Declined
                </Badge>
              </TableCell>

              <TableCell className="hidden text-slate-400 md:table-cell lg:hidden xl:table-column">
                2023-06-24
              </TableCell>

              <TableCell className="text-right font-medium text-white">
                $150.00
              </TableCell>
            </TableRow>

            <TableRow className="border-slate-800/70 hover:bg-slate-900/50">
              <TableCell className="py-4">
                <div className="font-medium text-white">Noah Williams</div>
                <div className="hidden text-sm text-slate-500 md:inline">
                  noah@example.com
                </div>
              </TableCell>

              <TableCell className="hidden text-slate-400 xl:table-column">
                Subscription
              </TableCell>

              <TableCell className="hidden xl:table-column">
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/10">
                  Approved
                </Badge>
              </TableCell>

              <TableCell className="hidden text-slate-400 md:table-cell lg:hidden xl:table-column">
                2023-06-25
              </TableCell>

              <TableCell className="text-right font-medium text-white">
                $350.00
              </TableCell>
            </TableRow>

            <TableRow className="border-slate-800/70 hover:bg-slate-900/50">
              <TableCell className="py-4">
                <div className="font-medium text-white">Emma Brown</div>
                <div className="hidden text-sm text-slate-500 md:inline">
                  emma@example.com
                </div>
              </TableCell>

              <TableCell className="hidden text-slate-400 xl:table-column">
                Sale
              </TableCell>

              <TableCell className="hidden xl:table-column">
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/10">
                  Approved
                </Badge>
              </TableCell>

              <TableCell className="hidden text-slate-400 md:table-cell lg:hidden xl:table-column">
                2023-06-26
              </TableCell>

              <TableCell className="text-right font-medium text-white">
                $450.00
              </TableCell>
            </TableRow>

            <TableRow className="border-slate-800/70 hover:bg-slate-900/50">
              <TableCell className="py-4">
                <div className="font-medium text-white">Liam Johnson</div>
                <div className="hidden text-sm text-slate-500 md:inline">
                  liam@example.com
                </div>
              </TableCell>

              <TableCell className="hidden text-slate-400 xl:table-column">
                Sale
              </TableCell>

              <TableCell className="hidden xl:table-column">
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/10">
                  Approved
                </Badge>
              </TableCell>

              <TableCell className="hidden text-slate-400 md:table-cell lg:hidden xl:table-column">
                2023-06-27
              </TableCell>

              <TableCell className="text-right font-medium text-white">
                $550.00
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
