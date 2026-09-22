import React from "react";

interface SectionColumnsType {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SectionColumns({
  title,
  description,
  children,
}: SectionColumnsType) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 border-b border-slate-800/80 py-8 md:grid-cols-10">
      <div className="col-span-4 space-y-2">
        <h2 className="text-lg font-semibold leading-none text-white">
          {title}
        </h2>

        {description && (
          <p className="max-w-md text-balance text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="col-span-6">{children}</div>
    </div>
  );
}
