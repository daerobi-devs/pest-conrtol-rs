"use client";

import React, { useMemo, useState } from "react";
import {
  Bug,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileDown,
  FileSpreadsheet,
  FolderOpen,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import {
  countReportRooms,
  formatDateId,
  formatMonthName,
  sumReportPests,
} from "@/lib/seed-data";
import { DemoRole, Report } from "@/types/report";

interface OverviewReportsProps {
  monthKey: string;
  reports: Report[];
  currentRole: DemoRole;
  onCreateNew: () => void;
  onOpenReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  onExportPdfSingle: (report: Report) => void;
  onExportXlsxSingle: (report: Report) => void;
  onExportPdfMonth: () => void;
  onExportXlsxMonth: () => void;
}

export function OverviewReports({
  monthKey,
  reports,
  currentRole,
  onCreateNew,
  onOpenReport,
  onDeleteReport,
  onExportPdfSingle,
  onExportXlsxSingle,
  onExportPdfMonth,
  onExportXlsxMonth,
}: OverviewReportsProps) {
  const [query, setQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...reports]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .filter((r) => {
        if (!q) return true;
        return (
          r.officer.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.date.includes(q) ||
          r.floors.some(
            (f) =>
              f.name.toLowerCase().includes(q) ||
              f.rooms.some((rm) => rm.name.toLowerCase().includes(q))
          )
        );
      });
  }, [reports, query]);

  const metrics = useMemo(() => {
    let totalRooms = 0;
    let totalSigned = 0;
    let totalPests = 0;
    for (const r of reports) {
      const counts = countReportRooms(r);
      totalRooms += counts.total;
      totalSigned += counts.signed;
      totalPests += sumReportPests(r);
    }
    const pct = totalRooms > 0 ? Math.round((totalSigned / totalRooms) * 100) : 0;
    return {
      reportCount: reports.length,
      totalRooms,
      totalPests,
      parafPct: pct,
    };
  }, [reports]);

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
            <span>Laporan Bulan Ini</span>
            <ClipboardList className="h-4 w-4 text-[#c8102e] dark:text-[#e5484d]" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {metrics.reportCount}
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            {formatMonthName(monthKey)}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
            <span>Ruangan Diperiksa</span>
            <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {metrics.totalRooms}
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            Titik area terdata
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
            <span>Total Temuan Hama</span>
            <Bug className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {metrics.totalPests}
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            Akumulasi 9 jenis vektor
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
            <span>Kelengkapan Paraf</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {metrics.parafPct}%
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            Verifikasi per ruangan
          </p>
        </div>
      </div>

      {/* Action toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari petugas, lantai, ruangan, atau tanggal..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#c8102e] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={reports.length === 0}
            onClick={onExportPdfMonth}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:opacity-40 sm:flex-none"
          >
            <FileDown className="h-3.5 w-3.5 text-[#e5484d]" />
            <span>PDF Bulanan</span>
          </button>
          <button
            type="button"
            disabled={reports.length === 0}
            onClick={onExportXlsxMonth}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:opacity-40 sm:flex-none"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Excel Bulanan</span>
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#c8102e] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#a90d27] active:scale-[0.98] sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Laporan Baru</span>
          </button>
        </div>
      </div>

      {/* Report list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] py-14 text-center px-4">
          <ClipboardList className="mb-3 h-10 w-10 text-[var(--text-muted)]" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {reports.length === 0
              ? `Belum ada laporan di bulan ${formatMonthName(monthKey)}`
              : "Tidak ada laporan yang cocok dengan pencarian"}
          </p>
          <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">
            Mulai catat pelaksanaan treatment harian dengan menekan tombol
            Laporan Baru.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#c8102e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a90d27]"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Laporan Hari Ini</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((report) => {
            const roomStats = countReportRooms(report);
            const pestTotal = sumReportPests(report);
            const canDelete =
              currentRole.role === "admin" ||
              report.officer.toLowerCase() === currentRole.name.toLowerCase();

            return (
              <div
                key={report.id}
                className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--border-strong)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--text-primary)]">
                        <Calendar className="h-3.5 w-3.5 text-[#e5484d]" />
                        {formatDateId(report.date)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                        <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        {report.officer || "Petugas belum diisi"}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {report.arrivalTime} - {report.departureTime}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                      <span>{report.floors.length} lantai</span>
                      <span>{roomStats.total} ruangan</span>
                      <span
                        className={
                          pestTotal > 0
                            ? "font-medium text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {pestTotal} temuan hama
                      </span>
                      <span>
                        Paraf: {roomStats.signed}/{roomStats.total}
                      </span>
                      {roomStats.photos > 0 && (
                        <span>{roomStats.photos} foto</span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenReport(report.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-strong)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[#c8102e]/60 hover:text-[#e5484d] sm:flex-none"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>Buka Form</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportPdfSingle(report)}
                      title="Unduh PDF laporan ini"
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    >
                      <FileDown className="h-3.5 w-3.5 text-[#e5484d]" />
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportXlsxSingle(report)}
                      title="Unduh Excel laporan ini"
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                      <span>XLSX</span>
                    </button>

                    {canDelete &&
                      (confirmDeleteId === report.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteReport(report.id);
                              setConfirmDeleteId(null);
                            }}
                            className="rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-[var(--border-subtle)] px-2 py-2 text-xs text-[var(--text-muted)]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(report.id)}
                          title="Hapus laporan"
                          className="rounded-lg border border-rose-500/25 p-2 text-rose-400 transition hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
