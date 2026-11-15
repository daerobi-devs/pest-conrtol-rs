"use client";

import React from "react";
import { FileCheck2, Save, Trash2, Upload } from "lucide-react";
import { compressImageFile, formatMonthName } from "@/lib/seed-data";
import { MonthApproval } from "@/types/report";

interface ApprovalViewProps {
  monthKey: string;
  approval: MonthApproval;
  onChange: (updated: MonthApproval) => void;
  onSave: () => void;
}

export function ApprovalView({
  monthKey,
  approval,
  onChange,
  onSave,
}: ApprovalViewProps) {
  const slots: Array<{
    keyName: "pjName" | "pwName" | "dkName";
    keyImg: "pjImg" | "pwImg" | "dkImg";
    title: string;
    subtitle: string;
  }> = [
    {
      keyName: "pjName",
      keyImg: "pjImg",
      title: "Penanggung Jawab Pekerjaan",
      subtitle: "PT. Moiko Mitsuba Indonesia",
    },
    {
      keyName: "pwName",
      keyImg: "pwImg",
      title: "Pengawas Pekerjaan",
      subtitle: "Customer (RSU Kota Tangerang Selatan)",
    },
    {
      keyName: "dkName",
      keyImg: "dkImg",
      title: "Diketahui & Disetujui",
      subtitle: "Customer (RSU Kota Tangerang Selatan)",
    },
  ];

  const handleUpload = async (
    keyImg: "pjImg" | "pwImg" | "dkImg",
    file: File | undefined
  ) => {
    if (!file) return;
    const compressed = await compressImageFile(file, 400, 0.85);
    if (compressed) {
      onChange({ ...approval, [keyImg]: compressed });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c8102e]/12 text-[#e5484d]">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Pengesahan Akhir Bulan — {formatMonthName(monthKey)}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Nama dan foto tanda tangan di bawah otomatis disisipkan ke seluruh
              halaman PDF laporan bulan ini.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          <Save className="h-4 w-4" />
          <span>Simpan Pengesahan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {slots.map((slot) => {
          const imgVal = approval[slot.keyImg];
          return (
            <div
              key={slot.keyName}
              className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {slot.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {slot.subtitle}
                </p>

                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                    Nama Terang &amp; Gelar
                  </label>
                  <input
                    type="text"
                    value={approval[slot.keyName]}
                    onChange={(e) =>
                      onChange({ ...approval, [slot.keyName]: e.target.value })
                    }
                    placeholder="Masukkan nama..."
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-white p-2">
                  {imgVal ? (
                    <img
                      src={imgVal}
                      alt={slot.title}
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">
                      Belum ada foto tanda tangan
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:border-[#c8102e]/50">
                    <Upload className="h-3.5 w-3.5 text-[#e5484d]" />
                    <span>{imgVal ? "Ganti TTD" : "Unggah TTD"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleUpload(slot.keyImg, e.target.files?.[0])
                      }
                      className="hidden"
                    />
                  </label>
                  {imgVal && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...approval, [slot.keyImg]: "" })}
                      className="rounded-lg border border-rose-500/30 p-2 text-rose-400 hover:bg-rose-500/10"
                      title="Hapus foto TTD"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
