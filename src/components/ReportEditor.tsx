"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  FileDown,
  FileSpreadsheet,
  FlaskConical,
  Minus,
  PenTool,
  Plus,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";
import {
  createEmptyFloor,
  createEmptyRoom,
  formatDateId,
  sumRoomPests,
} from "@/lib/seed-data";
import {
  METHODS,
  MonthApproval,
  PESTS,
  Report,
  RoomEntry,
} from "@/types/report";
import { PhotoModal } from "@/components/PhotoModal";
import { SignatureModal } from "@/components/SignatureModal";

interface ReportEditorProps {
  report: Report;
  monthApproval: MonthApproval;
  isDirty: boolean;
  onChangeReport: (updated: Report) => void;
  onSave: () => void;
  onBack: () => void;
  onExportPdf: () => void;
  onExportXlsx: () => void;
}

export function ReportEditor({
  report,
  monthApproval,
  isDirty,
  onChangeReport,
  onSave,
  onBack,
  onExportPdf,
  onExportXlsx,
}: ReportEditorProps) {
  const [viewMode, setViewMode] = useState<"mobile" | "paper">("mobile");
  const [collapsedFloors, setCollapsedFloors] = useState<
    Record<string, boolean>
  >({});
  const [photoTarget, setPhotoTarget] = useState<{
    floorIdx: number;
    roomIdx: number;
  } | null>(null);
  const [sigTarget, setSigTarget] = useState<{
    floorIdx: number;
    roomIdx: number;
  } | null>(null);

  const toggleFloorCollapse = (floorId: string) => {
    setCollapsedFloors((prev) => ({ ...prev, [floorId]: !prev[floorId] }));
  };

  const updateField = <K extends keyof Report>(key: K, value: Report[K]) => {
    onChangeReport({
      ...report,
      [key]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateFloor = (
    floorIdx: number,
    updater: (floor: Report["floors"][number]) => Report["floors"][number]
  ) => {
    const floors = report.floors.map((f, idx) =>
      idx === floorIdx ? updater(f) : f
    );
    updateField("floors", floors);
  };

  const updateRoom = (
    floorIdx: number,
    roomIdx: number,
    updater: (room: RoomEntry) => RoomEntry
  ) => {
    updateFloor(floorIdx, (floor) => ({
      ...floor,
      rooms: floor.rooms.map((rm, rIdx) =>
        rIdx === roomIdx ? updater(rm) : rm
      ),
    }));
  };

  const adjustPestCount = (
    floorIdx: number,
    roomIdx: number,
    pestIdx: number,
    delta: number
  ) => {
    updateRoom(floorIdx, roomIdx, (rm) => {
      const current = parseInt(rm.pests[pestIdx], 10) || 0;
      const next = Math.max(0, current + delta);
      const pests = rm.pests.map((v, i) =>
        i === pestIdx ? (next === 0 ? "" : String(next)) : v
      );
      return { ...rm, pests };
    });
  };

  const activePhotoRoom =
    photoTarget &&
    report.floors[photoTarget.floorIdx]?.rooms[photoTarget.roomIdx];
  const activeSigRoom =
    sigTarget && report.floors[sigTarget.floorIdx]?.rooms[sigTarget.roomIdx];

  return (
    <div className="space-y-4 pb-24 sm:pb-6">
      {/* Sticky editor toolbar */}
      <div className="sticky top-[57px] z-20 -mx-4 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:bg-[var(--bg-surface)]/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Daftar</span>
              </button>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Laporan {formatDateId(report.date)}
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isDirty
                    ? "Perubahan belum tersimpan"
                    : "Semua perubahan tersimpan"}
                </p>
              </div>
            </div>

            {/* Mobile save shortcut */}
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 sm:hidden"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Mode Switcher */}
            <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  viewMode === "mobile"
                    ? "bg-[#c8102e] text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Input Lapangan</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("paper")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  viewMode === "paper"
                    ? "bg-[#c8102e] text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview Kertas</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportPdf}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <FileDown className="h-3.5 w-3.5 text-[#e5484d]" />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={onExportXlsx}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>XLSX</span>
              </button>
              <button
                type="button"
                onClick={onSave}
                className="hidden items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] sm:flex"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "mobile" ? (
        <div className="space-y-4">
          {/* Header Metadata Card */}
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Informasi Pelaksanaan
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Nama Pelanggan
                </label>
                <input
                  type="text"
                  value={report.customer}
                  onChange={(e) => updateField("customer", e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Alamat Lokasi
                </label>
                <input
                  type="text"
                  value={report.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Nama Petugas
                </label>
                <input
                  type="text"
                  value={report.officer}
                  onChange={(e) => updateField("officer", e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Hari / Tanggal
                </label>
                <input
                  type="date"
                  value={report.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                    Waktu Datang
                  </label>
                  <input
                    type="time"
                    value={report.arrivalTime}
                    onChange={(e) => updateField("arrivalTime", e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                    Waktu Pulang
                  </label>
                  <input
                    type="time"
                    value={report.departureTime}
                    onChange={(e) =>
                      updateField("departureTime", e.target.value)
                    }
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Floors & Rooms Accordion Cards */}
          <div className="space-y-3">
            {report.floors.map((floor, fIdx) => {
              const collapsed = collapsedFloors[floor.id];
              const floorPestCount = floor.rooms.reduce(
                (acc, r) => acc + sumRoomPests(r),
                0
              );

              return (
                <section
                  key={floor.id}
                  className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                >
                  {/* Floor Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/70 px-4 py-3">
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <input
                        type="text"
                        value={floor.no}
                        onChange={(e) =>
                          updateFloor(fIdx, (fl) => ({
                            ...fl,
                            no: e.target.value,
                          }))
                        }
                        aria-label="Nomor lantai"
                        className="w-11 shrink-0 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2 py-1 text-center font-mono text-xs font-bold text-[var(--text-primary)]"
                      />
                      <input
                        type="text"
                        value={floor.name}
                        onChange={(e) =>
                          updateFloor(fIdx, (fl) => ({
                            ...fl,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Nama lantai / gedung..."
                        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-subtle)] focus:border-[#c8102e] focus:bg-[var(--bg-surface)] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[var(--bg-surface)] px-2 py-1 font-mono text-[11px] text-[var(--text-muted)]">
                        {floor.rooms.length} ruang · {floorPestCount} hama
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFloorCollapse(floor.id)}
                        className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                        aria-label="Toggle lantai"
                      >
                        {collapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </button>
                      {report.floors.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              "floors",
                              report.floors.filter((_, i) => i !== fIdx)
                            )
                          }
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10"
                          title="Hapus lantai ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {!collapsed && (
                    <div className="space-y-3 p-3 sm:p-4">
                      {floor.rooms.map((room, rIdx) => {
                        const roomPests = sumRoomPests(room);
                        return (
                          <div
                            key={room.id}
                            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/45 p-3.5 space-y-3"
                          >
                            {/* Room Name Row */}
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--bg-surface)] font-mono text-[11px] font-bold text-[var(--text-muted)]">
                                {rIdx + 1}
                              </span>
                              <input
                                type="text"
                                value={room.name}
                                onChange={(e) =>
                                  updateRoom(fIdx, rIdx, (rm) => ({
                                    ...rm,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Nama ruangan (misal: R. Triase IGD / Toilet)"
                                className="min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#c8102e] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateFloor(fIdx, (fl) => ({
                                    ...fl,
                                    rooms: fl.rooms.filter(
                                      (_, idx) => idx !== rIdx
                                    ),
                                  }))
                                }
                                className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                                title="Hapus ruangan"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Methods Toggle Chips */}
                            <div>
                              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                Metode Treatment
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {METHODS.map((m, mIdx) => {
                                  const active = Boolean(room.methods[mIdx]);
                                  return (
                                    <button
                                      key={m.code}
                                      type="button"
                                      title={m.label}
                                      onClick={() =>
                                        updateRoom(fIdx, rIdx, (rm) => ({
                                          ...rm,
                                          methods: rm.methods.map((val, idx) =>
                                            idx === mIdx ? (val ? 0 : 1) : val
                                          ),
                                        }))
                                      }
                                      className={`flex min-h-[38px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition active:scale-[0.97] ${
                                        active
                                          ? "border-[#c8102e]/60 bg-[#c8102e]/12 text-[#c8102e] dark:text-[#e5484d] font-semibold"
                                          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                                      }`}
                                    >
                                      <span
                                        className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                                          active
                                            ? "border-[#e5484d] bg-[#c8102e] text-white"
                                            : "border-[var(--border-strong)]"
                                        }`}
                                      >
                                        {active && <Check className="h-3 w-3" />}
                                      </span>
                                      <span className="font-mono font-bold">
                                        {m.code}
                                      </span>
                                      <span className="hidden sm:inline text-[11px] opacity-80">
                                        {m.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Pest Counts Stepper Grid */}
                            <div>
                              <div className="mb-1.5 flex items-center justify-between">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                  Temuan Hama
                                </p>
                                <span
                                  className={`font-mono text-[11px] font-semibold ${
                                    roomPests > 0
                                      ? "text-amber-400"
                                      : "text-[var(--text-muted)]"
                                  }`}
                                >
                                  Total: {roomPests}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                {PESTS.map((pestName, pIdx) => {
                                  const count =
                                    parseInt(room.pests[pIdx], 10) || 0;
                                  const highlighted = count > 0;
                                  return (
                                    <div
                                      key={pestName}
                                      className={`flex flex-col justify-between rounded-lg border p-2 transition ${
                                        highlighted
                                          ? "border-amber-500/40 bg-amber-500/10"
                                          : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                                      }`}
                                    >
                                      <span className="truncate text-[11px] font-medium text-[var(--text-secondary)]">
                                        {pestName}
                                      </span>
                                      <div className="mt-1.5 flex items-center justify-between gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            adjustPestCount(
                                              fIdx,
                                              rIdx,
                                              pIdx,
                                              -1
                                            )
                                          }
                                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                                          aria-label={`Kurangi ${pestName}`}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </button>
                                        <input
                                          type="number"
                                          min={0}
                                          inputMode="numeric"
                                          value={room.pests[pIdx]}
                                          placeholder="0"
                                          onChange={(e) =>
                                            updateRoom(fIdx, rIdx, (rm) => ({
                                              ...rm,
                                              pests: rm.pests.map((v, i) =>
                                                i === pIdx ? e.target.value : v
                                              ),
                                            }))
                                          }
                                          className="w-10 bg-transparent text-center font-mono text-sm font-bold text-[var(--text-primary)] focus:outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            adjustPestCount(fIdx, rIdx, pIdx, 1)
                                          }
                                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                                          aria-label={`Tambah ${pestName}`}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Room Actions: Photos & Paraf */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setPhotoTarget({
                                    floorIdx: fIdx,
                                    roomIdx: rIdx,
                                  })
                                }
                                className={`flex min-h-[42px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                  room.photos.length > 0
                                    ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                                }`}
                              >
                                <Camera className="h-4 w-4" />
                                <span>
                                  Foto ({room.photos.length}/4)
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setSigTarget({
                                    floorIdx: fIdx,
                                    roomIdx: rIdx,
                                  })
                                }
                                className={`flex min-h-[42px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                  room.signature
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                                }`}
                              >
                                <PenTool className="h-4 w-4" />
                                <span>
                                  {room.signature ? "Paraf Terisi" : "Isi Paraf"}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() =>
                          updateFloor(fIdx, (fl) => ({
                            ...fl,
                            rooms: [...fl.rooms, createEmptyRoom()],
                          }))
                        }
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border-strong)] py-2.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[#c8102e]/50 hover:text-[#e5484d]"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Ruangan di {floor.name || "Lantai Ini"}</span>
                      </button>
                    </div>
                  )}
                </section>
              );
            })}

            <button
              type="button"
              onClick={() =>
                updateField("floors", [
                  ...report.floors,
                  createEmptyFloor(report.floors.length + 1),
                ])
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#c8102e]/40 bg-[#c8102e]/10 py-3 text-sm font-semibold text-[#e5484d] transition hover:bg-[#c8102e]/15"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Lantai Berikutnya (No. {report.floors.length + 1})</span>
            </button>
          </div>

          {/* Chemical & Notes */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[#e5484d]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Penggunaan Chemical
                </h3>
              </div>
              <div className="space-y-2">
                {report.chemicals.map((chem, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-center font-mono text-xs text-[var(--text-muted)]">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={chem.activeIngredient}
                      placeholder="Nama bahan aktif..."
                      onChange={(e) => {
                        const next = report.chemicals.map((c, cIdx) =>
                          cIdx === idx
                            ? { ...c, activeIngredient: e.target.value }
                            : c
                        );
                        updateField("chemicals", next);
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={chem.amount}
                      placeholder="Jml"
                      onChange={(e) => {
                        const next = report.chemicals.map((c, cIdx) =>
                          cIdx === idx ? { ...c, amount: e.target.value } : c
                        );
                        updateField("chemicals", next);
                      }}
                      className="w-24 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:border-[#c8102e] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                Catatan Lapangan
              </h3>
              <textarea
                rows={6}
                value={report.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Catatan temuan khusus, rekomendasi sanitasi, atau tindak lanjut..."
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[#c8102e] focus:outline-none"
              />
            </section>
          </div>
        </div>
      ) : (
        /* Paper Preview Mode (Official PT. Moiko Mitsuba Indonesia Layout) */
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-white p-3 text-slate-900 shadow-sm">
          <div className="min-w-[880px] font-sans">
            <div className="mb-3 flex items-center gap-4">
              <div className="flex h-16 w-36 flex-col items-center justify-center rounded-[50%] border-[3px] border-[#c8102e] text-[#c8102e]">
                <span className="text-[8px] font-semibold tracking-widest">
                  PEST CONTROL
                </span>
                <span className="font-serif text-2xl font-black italic leading-none">
                  Moiko
                </span>
                <span className="text-[8px] font-semibold tracking-widest">
                  ANTI RAYAP
                </span>
              </div>
              <div className="flex-1 text-center text-xs">
                <h3 className="text-2xl font-bold tracking-tight">
                  PT. MOIKO MITSUBA INDONESIA
                </h3>
                <p>Ruko Bisnis Grand Royal Blok A No. 38</p>
                <p>
                  Jl. Boulevard Permata Raya Taman Royal 1 Cipondoh - Kota
                  Tangerang
                </p>
                <p>
                  Telp : (021) 2950 5617 (Hunting) | E-mail : moikoina@gmail.com
                </p>
              </div>
            </div>

            <div className="border-2 border-slate-900">
              <div className="border-b border-slate-900 py-1 text-center text-base font-extrabold tracking-wide">
                BUKTI PELAKSANAAN PEKERJAAN
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 border-b border-slate-900 px-3 py-2 text-xs">
                <div>
                  <div>
                    <span className="inline-block w-32 font-bold">
                      NAMA PELANGGAN
                    </span>
                    : {report.customer}
                  </div>
                  <div>
                    <span className="inline-block w-32 font-bold">ALAMAT</span>:{" "}
                    {report.address}
                  </div>
                  <div>
                    <span className="inline-block w-32 font-bold">
                      HARI / TGL
                    </span>
                    : {formatDateId(report.date)}
                  </div>
                </div>
                <div>
                  <div>
                    <span className="inline-block w-32 font-bold">
                      NAMA PETUGAS
                    </span>
                    : {report.officer}
                  </div>
                  <div>
                    <span className="inline-block w-32 font-bold">
                      WAKTU DATANG
                    </span>
                    : {report.arrivalTime}
                  </div>
                  <div>
                    <span className="inline-block w-32 font-bold">
                      WAKTU PULANG
                    </span>
                    : {report.departureTime}
                  </div>
                </div>
              </div>

              <table className="w-full border-collapse text-center text-[11px]">
                <thead>
                  <tr>
                    <th rowSpan={2} className="w-10 border border-slate-700 p-1">
                      NO.
                    </th>
                    <th rowSpan={2} className="border border-slate-700 p-1">
                      AREA / LOKASI
                    </th>
                    <th colSpan={6} className="border border-slate-700 p-1">
                      METODE TREATMENT
                    </th>
                    <th colSpan={9} className="border border-slate-700 p-1">
                      TEMUAN HAMA
                    </th>
                    <th rowSpan={2} className="w-16 border border-slate-700 p-1">
                      DOK.
                    </th>
                    <th rowSpan={2} className="w-20 border border-slate-700 p-1">
                      PARAF
                    </th>
                  </tr>
                  <tr>
                    {METHODS.map((m) => (
                      <th key={m.code} className="w-8 border border-slate-700 p-1">
                        {m.code}
                      </th>
                    ))}
                    {PESTS.map((p) => (
                      <th
                        key={p}
                        className="h-20 w-7 border border-slate-700 p-0.5 align-bottom"
                      >
                        <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap font-semibold">
                          {p}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.floors.map((fl) => (
                    <React.Fragment key={fl.id}>
                      <tr className="bg-slate-100 font-bold">
                        <td className="border border-slate-700 p-1" />
                        <td
                          colSpan={18}
                          className="border border-slate-700 px-2 py-1 text-left"
                        >
                          {fl.name}
                        </td>
                      </tr>
                      {fl.rooms.map((rm, rIdx) => (
                        <tr key={rm.id}>
                          <td className="border border-slate-700 p-1">
                            {rIdx === 0 ? fl.no : ""}
                          </td>
                          <td className="border border-slate-700 px-2 py-1 text-left">
                            {rm.name}
                          </td>
                          {rm.methods.map((mVal, mIdx) => (
                            <td key={mIdx} className="border border-slate-700">
                              {mVal ? "v" : ""}
                            </td>
                          ))}
                          {rm.pests.map((pVal, pIdx) => (
                            <td key={pIdx} className="border border-slate-700">
                              {pVal && pVal !== "0" ? pVal : ""}
                            </td>
                          ))}
                          <td className="border border-slate-700">
                            {rm.photos.length ? `${rm.photos.length} foto` : ""}
                          </td>
                          <td className="border border-slate-700 p-0.5">
                            {rm.signature && (
                              <img
                                src={rm.signature}
                                alt="Paraf"
                                className="mx-auto h-6 object-contain"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-2 text-[11px]">
              <strong>Keterangan :</strong> (S) Spray, (CF) Cold Fogger, (HF)
              Hot Fogging, (BT) Baiting, (PJ) Perangkap/Jebakan, (TB) Tabur
            </p>

            <div className="mt-3 grid grid-cols-2 gap-6 text-xs">
              <div>
                <p className="mb-1 font-bold">Penggunaan Chemical</p>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-10 border border-slate-700 p-1">No</th>
                      <th className="border border-slate-700 p-1">Bahan Aktif</th>
                      <th className="w-20 border border-slate-700 p-1">Jml</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.chemicals.map((c, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-700 p-1 text-center">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-700 px-2 py-1">
                          {c.activeIngredient}
                        </td>
                        <td className="border border-slate-700 px-2 py-1 text-center">
                          {c.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border border-slate-800 p-2">
                <p className="font-bold">Catatan :</p>
                <p className="mt-1 whitespace-pre-wrap">{report.notes}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 text-center text-xs">
              <div>
                <p>Penanggung Jawab Pekerjaan</p>
                <p className="font-semibold">MOIKO</p>
                <div className="my-2 flex h-14 items-center justify-center">
                  {monthApproval.pjImg && (
                    <img
                      src={monthApproval.pjImg}
                      alt="TTD PJ"
                      className="max-h-14"
                    />
                  )}
                </div>
                <p className="mx-6 border-b border-dotted border-slate-800 pb-0.5">
                  {monthApproval.pjName || " "}
                </p>
              </div>
              <div>
                <p>Pengawas Pekerjaan</p>
                <p className="font-semibold">CUSTOMER</p>
                <div className="my-2 flex h-14 items-center justify-center">
                  {monthApproval.pwImg && (
                    <img
                      src={monthApproval.pwImg}
                      alt="TTD Pengawas"
                      className="max-h-14"
                    />
                  )}
                </div>
                <p className="mx-6 border-b border-dotted border-slate-800 pb-0.5">
                  {monthApproval.pwName || " "}
                </p>
              </div>
              <div>
                <p>Diketahui &amp; Disetujui</p>
                <p className="font-semibold">CUSTOMER</p>
                <div className="my-2 flex h-14 items-center justify-center">
                  {monthApproval.dkImg && (
                    <img
                      src={monthApproval.dkImg}
                      alt="TTD Disetujui"
                      className="max-h-14"
                    />
                  )}
                </div>
                <p className="mx-6 border-b border-dotted border-slate-800 pb-0.5">
                  {monthApproval.dkName || " "}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {photoTarget && activePhotoRoom && (
        <PhotoModal
          roomName={activePhotoRoom.name}
          photos={activePhotoRoom.photos}
          onChange={(nextPhotos) =>
            updateRoom(photoTarget.floorIdx, photoTarget.roomIdx, (rm) => ({
              ...rm,
              photos: nextPhotos,
            }))
          }
          onClose={() => setPhotoTarget(null)}
        />
      )}

      {/* Signature Modal */}
      {sigTarget && activeSigRoom && (
        <SignatureModal
          roomName={activeSigRoom.name}
          initialSignature={activeSigRoom.signature}
          onSave={(sigData, applyToFloor) => {
            updateFloor(sigTarget.floorIdx, (fl) => ({
              ...fl,
              rooms: fl.rooms.map((rm, rIdx) => {
                if (rIdx === sigTarget.roomIdx) {
                  return { ...rm, signature: sigData };
                }
                if (applyToFloor && !rm.signature) {
                  return { ...rm, signature: sigData };
                }
                return rm;
              }),
            }));
            setSigTarget(null);
          }}
          onClear={() => {
            updateRoom(sigTarget.floorIdx, sigTarget.roomIdx, (rm) => ({
              ...rm,
              signature: "",
            }));
            setSigTarget(null);
          }}
          onClose={() => setSigTarget(null)}
        />
      )}
    </div>
  );
}
