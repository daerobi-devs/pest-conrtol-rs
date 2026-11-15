"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Eraser, Trash2, Upload, X } from "lucide-react";

interface SignatureModalProps {
  roomName: string;
  initialSignature: string;
  onSave: (signatureDataUrl: string, applyToFloor: boolean) => void;
  onClear: () => void;
  onClose: () => void;
}

export function SignatureModal({
  roomName,
  initialSignature,
  onSave,
  onClear,
  onClose,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(Boolean(initialSignature));
  const [applyToFloor, setApplyToFloor] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y);
    ctx.stroke();
    setDrawing(true);
    setHasStroke(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(
          img,
          (canvas.width - w) / 2,
          (canvas.height - h) / 2,
          w,
          h
        );
        setHasStroke(true);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (!hasStroke || !canvasRef.current) return;
    onSave(canvasRef.current.toDataURL("image/png"), applyToFloor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Paraf Ruangan
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {roomName || "Ruangan tanpa nama"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Tutup modal paraf"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border-strong)] bg-white">
          <canvas
            ref={canvasRef}
            width={400}
            height={160}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDrawing(false)}
            onPointerCancel={() => setDrawing(false)}
            className="h-40 w-full touch-none cursor-crosshair"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
          Goreskan paraf langsung dengan jari/mouse, atau unggah gambar paraf.
        </p>

        <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-3 text-xs text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={applyToFloor}
            onChange={(e) => setApplyToFloor(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-[#c8102e]"
          />
          <span>
            Terapkan juga ke ruangan lain di lantai ini yang belum ada parafnya
          </span>
        </label>

        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={handleUploadImage}
          className="hidden"
        />

        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Unggah Gambar</span>
          </button>
          <button
            type="button"
            onClick={handleClearCanvas}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Bersihkan</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Paraf</span>
          </button>
          <button
            type="button"
            disabled={!hasStroke}
            onClick={handleApply}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#c8102e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#a90d27] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            <span>Pakai Paraf</span>
          </button>
        </div>
      </div>
    </div>
  );
}
