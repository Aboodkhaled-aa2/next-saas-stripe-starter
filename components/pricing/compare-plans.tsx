import { PlansRow } from "@/types";
import { Check, Info } from "lucide-react";

import { comparePlans } from "@/config/subscriptions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HeaderSection } from "@/components/shared/header-section";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

const planColumns = ["starter", "business", "pro"] as const;

export function ComparePlans() {
  const renderCell = (value: string | boolean | null) => {
    if (value === null || value === false) {
      return <span className="text-slate-600">—</span>;
    }

    if (value === true) {
      return (
        <div className="flex justify-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10">
            <Check className="h-4 w-4 text-blue-400" />
          </div>
        </div>
      );
    }

    return (
      <span className="font-medium text-slate-300">
        {value}
      </span>
    );
  };

  return (
    <section className="bg-[#020617] py-20 text-white">
      <MaxWidthWrapper>
        <HeaderSection
          label="Plans & Pricing"
          title="Compare Your AI Employee Plans"
          subtitle="Choose the automation level that fits your cleaning business."
        />

        <div className="mt-12 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 shadow-2xl">
          <table className="w-full min-w-[760px] table-fixed border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="w-[34%] p-5 text-left">
                  <span className="text-sm font-medium uppercase tracking-wider text-slate-500">
                    Features
                  </span>
                </th>

                {planColumns.map((plan) => (
                  <th
                    key={plan}
                    className="border-l border-slate-800 p-5 text-center"
                  >
                    <div className="text-lg font-bold capitalize text-white">
                      {plan}
                    </div>

                    <div className="mt-1 text-sm font-normal text-slate-500">
                      {plan === "starter" && "$49 / month"}
                      {plan === "business" && "$99 / month"}
                      {plan === "pro" && "$249 / month"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {comparePlans.map((row: PlansRow, index: number) => (
                <tr
                  key={index}
                  className="border-b border-slate-800 last:border-b-0"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-300 lg:text-base">
                        {row.feature}
                      </span>

                      {row.tooltip && (
                        <Popover>
                          <PopoverTrigger className="rounded-full p-1 transition hover:bg-slate-800">
                            <Info className="h-4 w-4 text-slate-500" />
                          </PopoverTrigger>

                          <PopoverContent
                            side="top"
                            className="max-w-80 border-slate-700 bg-slate-900 p-3 text-sm text-slate-300"
                          >
                            {row.tooltip}
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </td>

                  {planColumns.map((plan) => (
                    <td
                      key={plan}
                      className="border-l border-slate-800 p-5 text-center text-sm lg:text-base"
                    >
                      {renderCell(row[plan])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          All plans are built for cleaning businesses and can be upgraded as
          your business grows.
        </p>
      </MaxWidthWrapper>
    </section>
  );
}
