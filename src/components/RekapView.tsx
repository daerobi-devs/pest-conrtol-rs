"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  FileDown,
  FileSpreadsheet,
  Link2,
} from "lucide-react";
import {
  countReportRooms,
  formatDateId,
  formatMonthName,
  sumReportPests,
} from "@/lib/seed-data";
import { METHODS, PESTS, Report } from "@/types/report";

interface RekapViewProps {
  monthKey: string;
  reports: Report[];
  onExportPdfMonth: () => void;
  onExportXlsxMonth: () => void;
  onOpenReport: (id: string) => void;
}

export function RekapView({
  monthKey,
  reports,
  onExportPdfMonth,
  onExportXlsxMonth,
  onOpenReport,
}: RekapViewProps) {
  const [copied, setCopied] = useState(false);

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [reports]
  );

  const { pestTotals, grandTotal, dailySummary, detailRows } = useMemo(() => {
    const pTotals = PESTS.map(() => 0);
    let gTotal = 0;

    const dSummary = sortedReports.map((r) => {
      const counts = countReportRooms(r);
      const total = sumReportPests(r);
      return {
        id: r.id,
        date: r.date,
        officer: r.officer,
        arrivalTime: r.arrivalTime,
        departureTime: r.departureTime,
        floorCount: r.floors.length,
        roomNamed: counts.named,
        roomTotal: counts.total,
        signed: counts.signed,
        totalPests: total,
      };
    });

    const rows: Array<{
      reportId: string;
      date: string;
      officer: string;
      floorName: string;
      roomName: string;
      methods: number[];
      pests: string[];
      photos: string[];
      signature: string;
    }> = [];

    sortedReports.forEach((r) => {
      r.floors.forEach((f) => {
        f.rooms.forEach((rm) => {
          rm.pests.forEach((v, idx) => {
            const val = parseInt(v, 10) || 0;
            pTotals[idx] += val;
            gTotal += val;
          });
          rows.push({
            reportId: r.id,
            date: r.date,
            officer: r.officer,
            floorName: f.name,
            roomName: rm.name,
            methods: rm.methods,
            pests: rm.pests,
            photos: rm.photos,
            signature: rm.signature,
          });
        });
      });
    });

    return {
      pestTotals: pTotals,
      grandTotal: gTotal,
      dailySummary: dSummary,
      detailRows: rows,
    };
  }, [sortedReports]);

  const maxPest = Math.max(1, ...pestTotals);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/#rekap-${monthKey}`
      : `/#rekap-${monthKey}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  if (sortedReports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-10 text-center">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Belum ada data rekap untuk {formatMonthName(monthKey)}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Pilih bulan lain di bagian atas atau tambahkan laporan baru terlebih
          dahulu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Action & Share Link */}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <Link2 className="h-3.5 w-3.5 text-[#e5484d]" />
            <span>Link Rekap Langsung ({formatMonthName(monthKey)})</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:border-[#c8102e]/50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 lg:pt-4">
          <button
            type="button"
            onClick={onExportPdfMonth}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[#c8102e]/50 sm:flex-none"
          >
            <FileDown className="h-4 w-4 text-[#e5484d]" />
            <span>Unduh PDF Bulan</span>
          </button>
          <button
            type="button"
            onClick={onExportXlsxMonth}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 sm:flex-none"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Unduh Excel Lengkap</span>
          </button>
        </div>
      </div>

      {/* Distribusi Temuan Hama (Live Analytics) */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Distribusi Temuan Vektor — {formatMonthName(monthKey)}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Akumulasi langsung dari seluruh laporan petugas yang masuk
            </p>
          </div>
          <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            Total: {grandTotal} temuan
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {PESTS.map((pest, idx) => {
            const val = pestTotals[idx];
            const widthPct = Math.round((val / maxPest) * 100);
            return (
              <div
                key={pest}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 p-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--text-secondary)]">
                    {pest}
                  </span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">
                    {val}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      val > 0 ? "bg-[#c8102e]" : "bg-transparent"
                    }`}
                    style={{ width: `${val > 0 ? Math.max(6, widthPct) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ringkasan Per Hari */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          Ringkasan Pelaksanaan Harian
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="py-2 pr-3 font-semibold">Tanggal</th>
                <th className="px-3 py-2 font-semibold">Petugas</th>
                <th className="px-3 py-2 font-semibold">Jam Kerja</th>
                <th className="px-3 py-2 text-center font-semibold">Lantai</th>
                <th className="px-3 py-2 text-center font-semibold">Ruangan</th>
                <th className="px-3 py-2 text-center font-semibold">
                  Total Temuan
                </th>
                <th className="pl-3 py-2 text-right font-semibold">
                  Paraf Terisi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {dailySummary.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onOpenReport(row.id)}
                  className="cursor-pointer transition hover:bg-[var(--bg-elevated)]/60"
                >
                  <td className="py-2.5 pr-3 font-mono font-semibold text-[var(--text-primary)]">
                    {formatDateId(row.date)}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--text-secondary)]">
                    {row.officer}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[var(--text-muted)]">
                    {row.arrivalTime} - {row.departureTime}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    {row.floorCount}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    {row.roomNamed > 0 ? (
                      row.roomNamed
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>0</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono font-bold text-[var(--text-primary)]">
                    {row.totalPests}
                  </td>
                  <td className="pl-3 py-2.5 text-right font-mono">
                    <span
                      className={
                        row.signed === row.roomTotal
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }
                    >
                      {row.signed}/{row.roomTotal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rekap Detail Spreadsheet Table */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Tabel Rekap Detail per Ruangan
          </h3>
          <span className="text-[11px] text-[var(--text-muted)]">
            {detailRows.length} baris inspeksi tercatat
          </span>
        </div>

        <div className="max-h-[65vh] overflow-auto rounded-lg border border-[var(--border-subtle)]">
          <table className="w-full border-collapse text-center text-[11px]">
            <thead className="sticky top-0 z-10 bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              <tr>
                <th className="border-b border-r border-[var(--border-subtle)] px-2.5 py-2 text-left whitespace-nowrap">
                  Tanggal
                </th>
                <th className="border-b border-r border-[var(--border-subtle)] px-2.5 py-2 text-left whitespace-nowrap">
                  Petugas
                </th>
                <th className="border-b border-r border-[var(--border-subtle)] px-2.5 py-2 text-left whitespace-nowrap">
                  Lantai
                </th>
                <th className="border-b border-r border-[var(--border-subtle)] px-2.5 py-2 text-left whitespace-nowrap">
                  Ruangan
                </th>
                {METHODS.map((m) => (
                  <th
                    key={m.code}
                    title={m.label}
                    className="border-b border-r border-[var(--border-subtle)] px-2 py-2 font-mono"
                  >
                    {m.code}
                  </th>
                ))}
                {PESTS.map((p) => (
                  <th
                    key={p}
                    className="border-b border-r border-[var(--border-subtle)] px-2 py-2 whitespace-nowrap"
                  >
                    {p}
                  </th>
                ))}
                <th className="border-b border-r border-[var(--border-subtle)] px-2 py-2 whitespace-nowrap">
                  Foto
                </th>
                <th className="border-b border-[var(--border-subtle)] px-2 py-2 whitespace-nowrap">
                  Paraf
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {detailRows.map((row, idx) => (
                <tr
                  key={`${row.reportId}-${idx}`}
                  className="hover:bg-[var(--bg-elevated)]/45"
                >
                  <td className="border-r border-[var(--border-subtle)] px-2.5 py-2 text-left font-mono whitespace-nowrap">
                    {formatDateId(row.date)}
                  </td>
                  <td className="border-r border-[var(--border-subtle)] px-2.5 py-2 text-left whitespace-nowrap">
                    {row.officer}
                  </td>
                  <td className="border-r border-[var(--border-subtle)] px-2.5 py-2 text-left whitespace-nowrap">
                    {row.floorName}
                  </td>
                  <td className="border-r border-[var(--border-subtle)] px-2.5 py-2 text-left font-medium text-[var(--text-primary)] whitespace-nowrap">
                    {row.roomName || "-"}
                  </td>
                  {row.methods.map((mVal, mIdx) => (
                    <td
                      key={mIdx}
                      className="border-r border-[var(--border-subtle)] px-2 py-2 font-mono"
                    >
                      {mVal ? (
                        <span className="text-emerald-400">v</span>
                      ) : (
                        ""
                      )}
                    </td>
                  ))}
                  {row.pests.map((pVal, pIdx) => {
                    const num = parseInt(pVal, 10) || 0;
                    return (
                      <td
                        key={pIdx}
                        className={`border-r border-[var(--border-subtle)] px-2 py-2 font-mono ${
                          num > 0
                            ? "font-bold text-amber-400"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {num > 0 ? num : ""}
                      </td>
                    );
                  })}
                  <td className="border-r border-[var(--border-subtle)] px-2 py-2 font-mono">
                    {row.photos.length > 0 ? `${row.photos.length}` : "-"}
                  </td>
                  <td className="px-2 py-1.5">
                    {row.signature ? (
                      <img
                        src={row.signature}
                        alt="Paraf"
                        className="mx-auto h-5 rounded bg-white px-1 object-contain"
                      />
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-[var(--bg-elevated)] font-mono font-bold text-[var(--text-primary)]">
              <tr className="border-t border-[var(--border-strong)]">
                <td
                  colSpan={10}
                  className="border-r border-[var(--border-subtle)] px-3 py-2.5 text-left"
                >
                  TOTAL TEMUAN HAMA
                </td>
                {pestTotals.map((total, idx) => (
                  <td
                    key={idx}
                    className="border-r border-[var(--border-subtle)] px-2 py-2.5 text-amber-400"
                  >
                    {total}
                  </td>
                ))}
                <td colSpan={2} className="px-2 py-2.5">
                  {grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
