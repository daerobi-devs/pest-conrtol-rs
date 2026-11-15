"use client";

import React, { useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, X } from "lucide-react";
import { compressImageFile } from "@/lib/seed-data";

interface PhotoModalProps {
  roomName: string;
  photos: string[];
  onChange: (nextPhotos: string[]) => void;
  onClose: () => void;
}

export function PhotoModal({
  roomName,
  photos,
  onChange,
  onClose,
}: PhotoModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    const updated = [...photos];
    for (const file of Array.from(files)) {
      if (updated.length >= 4) break;
      const compressed = await compressImageFile(file, 640, 0.72);
      if (compressed) updated.push(compressed);
    }
    onChange(updated);
    setProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Dokumentasi Lapangan
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {roomName || "Ruangan tanpa nama"} — Maksimal 4 foto ({photos.length}/4)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Tutup modal foto"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid preview */}
        {photos.length > 0 ? (
          <div className="mb-4 grid grid-cols-2 gap-3">
            {photos.map((src, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
              >
                <img
                  src={src}
                  alt={`Dokumentasi ${idx + 1}`}
                  className="h-32 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange(photos.filter((_, itemIdx) => itemIdx !== idx))
                  }
                  className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[11px] font-medium text-rose-300 backdrop-blur-xs hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Hapus</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-elevated)]/50 py-8 text-center">
            <Camera className="mb-2 h-8 w-8 text-[var(--text-muted)]" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              Belum ada foto dokumentasi
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Ambil foto langsung dari kamera HP atau pilih dari galeri
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={photos.length >= 4 || processing}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[#c8102e]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4 text-[#e5484d]" />
            <span>
              {processing
                ? "Mengompresi foto..."
                : photos.length >= 4
                ? "Batas 4 Foto Tercapai"
                : "Tambah Foto"}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#c8102e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a90d27]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
