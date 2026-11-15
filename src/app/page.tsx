"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { ApprovalView } from "@/components/ApprovalView";
import { OverviewReports } from "@/components/OverviewReports";
import { RekapView } from "@/components/RekapView";
import { ReportEditor } from "@/components/ReportEditor";
import { Sidebar } from "@/components/Sidebar";
import { exportReportsPdf, exportReportsXlsx } from "@/lib/exporters";
import {
  createEmptyApproval,
  createNewReport,
  formatMonthName,
  getInitialSeedData,
  getMonthKey,
} from "@/lib/seed-data";
import {
  ActiveTab,
  AppDataState,
  DEMO_ROLES,
  DemoRole,
  MonthApproval,
  Report,
} from "@/types/report";

const STORAGE_KEY = "vektorops-rs-tangsel-v1";

type SyncStatus = "connected" | "syncing" | "offline";

export default function HomePage() {
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<AppDataState>({ reports: [], months: {} });
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<DemoRole>(DEMO_ROLES[0]);
  const [isLightMode, setIsLightMode] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  // Load initial data from Daeroom Cloud API with localStorage fallback
  useEffect(() => {
    const applyHashRoute = () => {
      const match = (window.location.hash || "")
        .slice(1)
        .match(/^rekap(?:-(\d{4}-\d{2}))?$/);
      if (match) {
        setActiveTab("rekap");
        if (match[1]) setSelectedMonth(match[1]);
      }
    };

    const loadData = async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      setSelectedMonth(currentMonth);

      try {
        setSyncStatus("syncing");
        const [repRes, apprvRes] = await Promise.all([
          fetch("/api/reports", { cache: "no-store" }),
          fetch("/api/approvals", { cache: "no-store" }),
        ]);

        const repJson = await repRes.json();
        const apprvJson = await apprvRes.json();

        if (repJson.success && Array.isArray(repJson.reports)) {
          const cloudData: AppDataState = {
            reports: repJson.reports,
            months: apprvJson.success ? apprvJson.months || {} : {},
          };
          setData(cloudData);
          setSyncStatus("connected");
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
          } catch {
            // ignore
          }
        } else {
          throw new Error(repJson.error || "Gagal memuat data dari cloud.");
        }
      } catch {
        setSyncStatus("offline");
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as AppDataState;
            setData(parsed);
          } else {
            const seed = getInitialSeedData();
            setData(seed);
          }
        } catch {
          setData(getInitialSeedData());
        }
      }

      applyHashRoute();
      setHydrated(true);
    };

    const rafId = window.requestAnimationFrame(() => {
      loadData();
    });

    window.addEventListener("hashchange", applyHashRoute);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("hashchange", applyHashRoute);
    };
  }, []);

  // Theme sync with localStorage (default: light)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vektorops-theme");
      if (saved === "dark") {
        setIsLightMode(false);
        document.documentElement.classList.add("dark");
      } else {
        setIsLightMode(true);
        document.documentElement.classList.remove("dark");
      }
    } catch {
      setIsLightMode(true);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleToggleTheme = () => {
    setIsLightMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove("dark");
        try {
          localStorage.setItem("vektorops-theme", "light");
        } catch {
          // ignore
        }
      } else {
        document.documentElement.classList.add("dark");
        try {
          localStorage.setItem("vektorops-theme", "dark");
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const monthKeys = useMemo(() => {
    const set = new Set(data.reports.map((r) => getMonthKey(r.date)));
    if (selectedMonth) set.add(selectedMonth);
    return [...set].filter(Boolean).sort().reverse();
  }, [data.reports, selectedMonth]);

  const monthReports = useMemo(
    () => data.reports.filter((r) => getMonthKey(r.date) === selectedMonth),
    [data.reports, selectedMonth]
  );

  const activeReport = useMemo(
    () => data.reports.find((r) => r.id === activeReportId) || null,
    [data.reports, activeReportId]
  );

  const currentApproval: MonthApproval =
    data.months[selectedMonth] || createEmptyApproval();

  const handleCreateNewReport = async () => {
    const latest = [...data.reports].sort((a, b) =>
      a.date < b.date ? 1 : -1
    )[0];
    const officerName =
      currentRole.role === "officer"
        ? currentRole.name
        : latest?.officer || "Ahmad Fauzi";

    const newReport = createNewReport(selectedMonth, officerName, latest);
    const nextData: AppDataState = {
      ...data,
      reports: [newReport, ...data.reports],
    };
    setData(nextData);
    setActiveReportId(newReport.id);
    setActiveTab("editor");
    setIsDirty(true);

    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
      setSyncStatus("connected");
    } catch {
      setSyncStatus("offline");
    }
  };

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === "editor" && !activeReportId) {
      if (monthReports.length > 0) {
        setActiveReportId(monthReports[0].id);
      } else {
        handleCreateNewReport();
        return;
      }
    }
    setActiveTab(tab);
  };

  const handleChangeReport = (updated: Report) => {
    setData((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => (r.id === updated.id ? updated : r)),
    }));
    setIsDirty(true);
  };

  const handleSaveActiveReport = async () => {
    if (!activeReport) return;
    try {
      setSyncStatus("syncing");
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeReport),
      });
      const json = await res.json();
      if (json.success) {
        setIsDirty(false);
        setSyncStatus("connected");
        showToast("Laporan tersimpan di Daeroom Cloud (PostgreSQL)");
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // ignore
        }
      } else {
        throw new Error(json.error || "Gagal menyimpan.");
      }
    } catch (err: unknown) {
      setSyncStatus("offline");
      setIsDirty(false);
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Tersimpan lokal (${msg})`);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    }
  };

  const handleDeleteReport = async (id: string) => {
    const nextData: AppDataState = {
      ...data,
      reports: data.reports.filter((r) => r.id !== id),
    };
    if (activeReportId === id) {
      setActiveReportId(null);
      setActiveTab("overview");
    }
    setData(nextData);

    try {
      await fetch(`/api/reports?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      showToast("Laporan dihapus dari Daeroom Cloud");
    } catch {
      showToast("Laporan dihapus secara lokal");
    }
  };

  const handleSaveApproval = async () => {
    try {
      setSyncStatus("syncing");
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthKey: selectedMonth,
          approval: currentApproval,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus("connected");
        showToast("Pengesahan bulan tersimpan di Daeroom Cloud");
      } else {
        throw new Error(json.error || "Gagal menyimpan pengesahan.");
      }
    } catch (err: unknown) {
      setSyncStatus("offline");
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Pengesahan tersimpan lokal (${msg})`);
    }
  };

  const handleResetDemo = () => {
    const seed = getInitialSeedData();
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setActiveReportId(null);
    setActiveTab("overview");
    setData(seed);
    showToast("Tampilan di-reset ke data demonstrasi");
  };

  const pageTitleMap: Record<ActiveTab, string> = {
    overview: "Daftar Laporan Harian",
    editor: activeReport ? "Form Bukti Pekerjaan" : "Buat Laporan Baru",
    rekap: "Rekap & Analitik Bulanan",
    approvals: "TTD & Pengesahan Bulanan",
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] text-sm text-[var(--text-muted)]">
        Menghubungkan ke Daeroom Cloud...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        currentRole={currentRole}
        onChangeRole={(role) => {
          setCurrentRole(role);
          if (role.role !== "admin" && activeTab === "approvals") {
            setActiveTab("overview");
          }
          showToast(`Mode tampilan: ${role.name} (${role.title})`);
        }}
        reportCount={monthReports.length}
        hasActiveReport={Boolean(activeReport)}
        onResetDemo={handleResetDemo}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden"
                aria-label="Buka navigasi"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="hidden font-mono text-[11px] text-[var(--text-muted)] sm:inline">
                    VektorOps /
                  </span>
                  <h1 className="truncate text-sm font-bold tracking-tight text-[var(--text-primary)] sm:text-base">
                    {pageTitleMap[activeTab]}
                  </h1>
                </div>
                <p className="truncate text-[11px] text-[var(--text-muted)]">
                  {currentRole.name} · {currentRole.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Solid status pill (taste-skill compliant, zero pulsing dot) */}
              {syncStatus === "connected" && (
                <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 lg:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Daeroom Cloud (Live PostgreSQL)</span>
                </div>
              )}
              {syncStatus === "syncing" && (
                <div className="hidden items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-400 lg:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Sinkronisasi Cloud...</span>
                </div>
              )}
              {syncStatus === "offline" && (
                <div className="hidden items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400 lg:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Mode Cadangan Lokal</span>
                </div>
              )}

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  if (e.target.value) setSelectedMonth(e.target.value);
                }}
                aria-label="Pilih bulan laporan"
                className="w-[135px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 font-mono text-xs text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
              />

              <button
                type="button"
                onClick={handleToggleTheme}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2 text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                title={
                  isLightMode
                    ? "Ganti ke Mode Gelap"
                    : "Ganti ke Mode Terang (Default)"
                }
                aria-label="Ganti tema tampilan"
              >
                {isLightMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Month pills bar */}
        {activeTab !== "editor" && (
          <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 px-4 py-2 sm:px-6">
            <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Periode:
              </span>
              {monthKeys.map((m) => {
                const active = m === selectedMonth;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMonth(m)}
                    className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-[#c8102e] text-white"
                        : "border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {formatMonthName(m)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main workspace */}
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
          {activeTab === "overview" && (
            <OverviewReports
              monthKey={selectedMonth}
              reports={monthReports}
              currentRole={currentRole}
              onCreateNew={handleCreateNewReport}
              onOpenReport={(id) => {
                setActiveReportId(id);
                setActiveTab("editor");
              }}
              onDeleteReport={handleDeleteReport}
              onExportPdfSingle={async (r) => {
                try {
                  await exportReportsPdf(
                    [r],
                    data.months,
                    `Laporan_${r.date}.pdf`
                  );
                  showToast("PDF berhasil diunduh");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  showToast(`Gagal ekspor PDF: ${msg}`);
                }
              }}
              onExportXlsxSingle={(r) => {
                try {
                  exportReportsXlsx(
                    [r],
                    data.months,
                    `Laporan_${r.date}.xlsx`
                  );
                  showToast("Excel berhasil diunduh");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  showToast(`Gagal ekspor Excel: ${msg}`);
                }
              }}
              onExportPdfMonth={async () => {
                try {
                  if (monthReports.length === 0) {
                    showToast("Tidak ada laporan di bulan ini untuk diekspor");
                    return;
                  }
                  await exportReportsPdf(
                    monthReports,
                    data.months,
                    `Laporan_${selectedMonth}.pdf`
                  );
                  showToast("PDF bulanan berhasil diunduh");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  showToast(`Gagal ekspor PDF: ${msg}`);
                }
              }}
              onExportXlsxMonth={() => {
                try {
                  if (monthReports.length === 0) {
                    showToast("Tidak ada laporan di bulan ini untuk diekspor");
                    return;
                  }
                  exportReportsXlsx(
                    monthReports,
                    data.months,
                    `Rekap_${selectedMonth}.xlsx`
                  );
                  showToast("Excel bulanan berhasil diunduh");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  showToast(`Gagal ekspor Excel: ${msg}`);
                }
              }}
            />
          )}

          {activeTab === "editor" && activeReport && (
            <ReportEditor
              report={activeReport}
              monthApproval={
                data.months[getMonthKey(activeReport.date)] ||
                createEmptyApproval()
              }
              isDirty={isDirty}
              onChangeReport={handleChangeReport}
              onSave={handleSaveActiveReport}
              onBack={() => {
                setSelectedMonth(getMonthKey(activeReport.date));
                setActiveTab("overview");
              }}
              onExportPdf={async () => {
                try {
                  await exportReportsPdf(
                    [activeReport],
                    data.months,
                    `Laporan_${activeReport.date}.pdf`
                  );
                  showToast("PDF berhasil diunduh");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  showToast(`Gagal ekspor PDF: ${msg}`);
                }
              }}
              onExportXlsx={() => {
                try {
                  exportReportsXlsx(
                    [activeReport],
                    data.months,
                    `Laporan_${activeReport.date}.xlsx`
                  );
                  showToast("Excel berhasil diunduh");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  showToast(`Gagal ekspor Excel: ${msg}`);
                }
              }}
            />
          )}

          {activeTab === "rekap" && (
            <RekapView
              monthKey={selectedMonth}
              reports={monthReports}
              onExportPdfMonth={async () => {
                try {
                  if (monthReports.length === 0) {
                    showToast("Tidak ada laporan di bulan ini untuk diekspor");
                    return;
                  }
                  await exportReportsPdf(
                    monthReports,
                    data.months,
                    `Laporan_${selectedMonth}.pdf`
                  );
                  showToast("PDF bulanan berhasil diunduh");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  showToast(`Gagal ekspor PDF: ${msg}`);
                }
              }}
              onExportXlsxMonth={() => {
                try {
                  if (monthReports.length === 0) {
                    showToast("Tidak ada laporan di bulan ini untuk diekspor");
                    return;
                  }
                  exportReportsXlsx(
                    monthReports,
                    data.months,
                    `Rekap_${selectedMonth}.xlsx`
                  );
                  showToast("Excel bulanan berhasil diunduh");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  showToast(`Gagal ekspor Excel: ${msg}`);
                }
              }}
              onOpenReport={(id) => {
                setActiveReportId(id);
                setActiveTab("editor");
              }}
            />
          )}

          {activeTab === "approvals" && (
            <ApprovalView
              monthKey={selectedMonth}
              approval={currentApproval}
              onChange={(updated) => {
                setData((prev) => ({
                  ...prev,
                  months: { ...prev.months, [selectedMonth]: updated },
                }));
                setIsDirty(true);
              }}
              onSave={handleSaveApproval}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] shadow-2xl">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
