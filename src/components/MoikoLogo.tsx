import React from "react";

export function MoikoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c8102e]/40 bg-[#c8102e]/12">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2.5L20 6.5V12.5C20 17.2 16.5 20.8 12 22C7.5 20.8 4 17.2 4 12.5V6.5L12 2.5Z"
            stroke="#c8102e"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 14.5V9.5L12 12.5L15.5 9.5V14.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold tracking-tight text-[var(--text-primary)]">
              VektorOps
            </span>
            <span className="rounded border border-[#c8102e]/30 bg-[#c8102e]/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#e5484d]">
              Moiko
            </span>
          </div>
          <p className="truncate text-[11px] text-[var(--text-muted)]">
            RSU Kota Tangerang Selatan
          </p>
        </div>
      )}
    </div>
  );
}
