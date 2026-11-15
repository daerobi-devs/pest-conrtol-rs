"use client";

import React from "react";
import {
  BarChart3,
  ClipboardList,
  FileCheck2,
  FilePlus2,
  RotateCcw,
  Shield,
  UserCheck,
  X,
} from "lucide-react";
import { MoikoLogo } from "@/components/MoikoLogo";
import { ActiveTab, DEMO_ROLES, DemoRole } from "@/types/report";

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  currentRole: DemoRole;
  onChangeRole: (role: DemoRole) => void;
  reportCount: number;
  hasActiveReport: boolean;
  onResetDemo: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  currentRole,
  onChangeRole,
  reportCount,
  hasActiveReport,
  onResetDemo,
}: SidebarProps) {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    adminOnly?: boolean;
  }> = [
    {
      id: "overview",
      label: "Daftar Laporan",
      icon: ClipboardList,
      badge: reportCount,
    },
    {
      id: "editor",
      label: hasActiveReport ? "Form Pekerjaan" : "Buat Laporan",
      icon: FilePlus2,
    },
    {
      id: "rekap",
      label: "Rekap & Analitik",
      icon: BarChart3,
    },
    {
      id: "approvals",
      label: "TTD & Pengesahan",
      icon: FileCheck2,
      adminOnly: true,
    },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] p-4">
      <div className="space-y-6">
        {/* Top brand */}
        <div className="flex items-center justify-between">
          <MoikoLogo />
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] md:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation group */}
        <div className="space-y-1">
          <p className="px-2.5 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Operasional
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const disabled = item.adminOnly && currentRole.role !== "admin";
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={
                  disabled
                    ? "Khusus akun Pengawas / Admin RS"
                    : item.label
                }
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#c8102e]/10 text-[#c8102e] dark:text-[#e5484d] border border-[#c8102e]/30 font-semibold"
                    : disabled
                    ? "cursor-not-allowed opacity-45 text-[var(--text-muted)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? "text-[#c8102e] dark:text-[#e5484d]"
                        : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] ${
                      isActive
                        ? "bg-[#c8102e]/15 text-[#c8102e] dark:text-[#e5484d] font-bold"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role switcher & footer */}
      <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Simulasi Akses (Phase 1)
            </span>
          </div>
          <div className="space-y-1">
            {DEMO_ROLES.map((r) => {
              const selected = currentRole.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onChangeRole(r)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-all ${
                    selected
                      ? "border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                      : "border border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/60"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                      r.role === "admin"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-sky-500/15 text-sky-400"
                    }`}
                  >
                    {r.role === "admin" ? (
                      <Shield className="h-3.5 w-3.5" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.name}</div>
                    <div className="truncate text-[10px] text-[var(--text-muted)]">
                      {r.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onResetDemo}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Data Demo</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block md:w-64 md:shrink-0">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile slide-out drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full w-72 max-w-[85vw]">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
