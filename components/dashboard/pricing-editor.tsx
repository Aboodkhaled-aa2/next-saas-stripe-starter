"use client";

import { useEffect, useState } from "react";

type PriceRow = {
  service: string;
  method: "fixed" | "per_unit" | "quote";
  basePrice: string;
  includedBedrooms: string;
  includedBathrooms: string;
  includedSqft: string;
  extraBedroom: string;
  extraBathroom: string;
  extraSqft: string;
  extraSqftUnit: string;
  notes: string;
};

const blankRow = (): PriceRow => ({
  service: "", method: "fixed", basePrice: "", includedBedrooms: "",
  includedBathrooms: "", includedSqft: "", extraBedroom: "", extraBathroom: "",
  extraSqft: "", extraSqftUnit: "500", notes: "",
});

function readValue(value: string): { rows: PriceRow[]; legacy: string } {
  try {
    const parsed = JSON.parse(value);
    if (parsed?.format === "smart-cleaning-pricing-v1" && Array.isArray(parsed.rows)) {
      return { rows: parsed.rows.length ? parsed.rows : [blankRow()], legacy: parsed.legacy || "" };
    }
  } catch {}
  return { rows: [blankRow()], legacy: value || "" };
}

export function PricingEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [rows, setRows] = useState<PriceRow[]>(() => readValue(value).rows);
  const [legacy, setLegacy] = useState(() => readValue(value).legacy);

  useEffect(() => {
    const next = readValue(value);
    setRows(next.rows);
    setLegacy(next.legacy);
  }, [value]);

  function commit(nextRows: PriceRow[], nextLegacy = legacy) {
    setRows(nextRows);
    onChange(JSON.stringify({ format: "smart-cleaning-pricing-v1", rows: nextRows, legacy: nextLegacy }));
  }

  function update(index: number, key: keyof PriceRow, nextValue: string) {
    commit(rows.map((row, i) => i === index ? { ...row, [key]: nextValue } : row));
  }

  const inputClass = "mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500";
  const labelClass = "block text-xs font-medium text-slate-400";

  return (
    <div className="space-y-4">
      <p className="text-xs leading-5 text-slate-400">Add a separate pricing rule for each service. Leave a field blank if it does not apply. Existing pricing notes are preserved below.</p>
      {rows.map((row, index) => (
        <div key={index} className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Service pricing {index + 1}</h4>
            {rows.length > 1 && <button type="button" onClick={() => commit(rows.filter((_, i) => i !== index))} className="text-xs text-rose-400">Remove</button>}
          </div>
          <label className={labelClass}>Service name
            <input className={inputClass} value={row.service} onChange={e => update(index, "service", e.target.value)} placeholder="Standard Home Cleaning" />
          </label>
          <label className={labelClass}>Pricing method
            <select className={inputClass} value={row.method} onChange={e => update(index, "method", e.target.value as PriceRow["method"])}>
              <option value="fixed">Base price + add-ons</option>
              <option value="per_unit">Price per unit</option>
              <option value="quote">Custom quote</option>
            </select>
          </label>
          {row.method !== "quote" && <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>Base price (USD)<input className={inputClass} type="number" min="0" step="0.01" value={row.basePrice} onChange={e => update(index, "basePrice", e.target.value)} placeholder="120" /></label>
            <label className={labelClass}>Included bedrooms<input className={inputClass} type="number" min="0" value={row.includedBedrooms} onChange={e => update(index, "includedBedrooms", e.target.value)} placeholder="2" /></label>
            <label className={labelClass}>Included bathrooms<input className={inputClass} type="number" min="0" value={row.includedBathrooms} onChange={e => update(index, "includedBathrooms", e.target.value)} placeholder="1" /></label>
            <label className={labelClass}>Included square feet<input className={inputClass} type="number" min="0" value={row.includedSqft} onChange={e => update(index, "includedSqft", e.target.value)} placeholder="1500" /></label>
            <label className={labelClass}>Each extra bedroom ($)<input className={inputClass} type="number" min="0" step="0.01" value={row.extraBedroom} onChange={e => update(index, "extraBedroom", e.target.value)} placeholder="20" /></label>
            <label className={labelClass}>Each extra bathroom ($)<input className={inputClass} type="number" min="0" step="0.01" value={row.extraBathroom} onChange={e => update(index, "extraBathroom", e.target.value)} placeholder="15" /></label>
            <label className={labelClass}>Extra square feet charge ($)<input className={inputClass} type="number" min="0" step="0.01" value={row.extraSqft} onChange={e => update(index, "extraSqft", e.target.value)} placeholder="25" /></label>
            <label className={labelClass}>Per additional square feet<input className={inputClass} type="number" min="1" value={row.extraSqftUnit} onChange={e => update(index, "extraSqftUnit", e.target.value)} placeholder="500" /></label>
          </div>}
          <label className={labelClass}>Additional rules / discounts
            <textarea className={inputClass} rows={2} value={row.notes} onChange={e => update(index, "notes", e.target.value)} placeholder="Weekly discount 10%; biweekly discount 5%; minimum charge..." />
          </label>
        </div>
      ))}
      <button type="button" onClick={() => commit([...rows, blankRow()])} className="rounded-lg border border-blue-500/40 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/10">+ Add another service</button>
      <label className={labelClass}>Existing pricing notes / other pricing details
        <textarea className={inputClass} rows={3} value={legacy} onChange={e => { setLegacy(e.target.value); commit(rows, e.target.value); }} placeholder="Preserved existing pricing information or explain special cases..." />
      </label>
    </div>
  );
}
