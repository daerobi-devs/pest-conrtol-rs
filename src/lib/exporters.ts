import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  METHODS,
  MonthApproval,
  PESTS,
  Report,
} from "@/types/report";
import {
  createEmptyApproval,
  formatDateId,
  getMonthKey,
  sumRoomPests,
} from "@/lib/seed-data";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function toRasterDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl) return "";
  if (
    dataUrl.startsWith("data:image/png") ||
    dataUrl.startsWith("data:image/jpeg")
  ) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 220;
      canvas.height = img.height || 80;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve("");
    img.src = dataUrl;
  });
}

export async function exportReportsPdf(
  reports: Report[],
  months: Record<string, MonthApproval>,
  filename: string
): Promise<void> {
  if (!reports.length) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const L = 24;
  const R = W - 24;

  const drawField = (
    x: number,
    label: string,
    x1: number,
    x2: number,
    value: string,
    y: number
  ) => {
    doc.setFont("helvetica", "bold").setFontSize(7.5).text(label, x, y);
    if (label) doc.text(":", x1 - 6, y);
    doc
      .setFont("helvetica", "normal")
      .setFontSize(8.5)
      .text(String(value || ""), x1, y - 1);
    doc
      .setLineDashPattern([1, 1.5], 0)
      .setLineWidth(0.4)
      .line(x1, y + 2, x2, y + 2);
    doc.setLineDashPattern([], 0);
  };

  for (let idx = 0; idx < reports.length; idx++) {
    const r = reports[idx];
    if (idx > 0) doc.addPage();
    const M = months[getMonthKey(r.date)] || createEmptyApproval();

    // Header kop surat Moiko
    doc
      .setDrawColor(200, 16, 46)
      .setLineWidth(2)
      .ellipse(L + 50, 48, 48, 22)
      .setTextColor(200, 16, 46)
      .setFont("helvetica", "bolditalic")
      .setFontSize(17)
      .text("Moiko", L + 50, 53, { align: "center" });

    doc
      .setFontSize(5)
      .text("PEST CONTROL", L + 50, 35, { align: "center" })
      .text("ANTI RAYAP", L + 50, 67, { align: "center" });

    doc
      .setTextColor(0)
      .setDrawColor(0)
      .setFont("helvetica", "bold")
      .setFontSize(16)
      .text("PT. MOIKO MITSUBA INDONESIA", (L + 110 + R) / 2, 38, {
        align: "center",
      });

    doc
      .setFont("helvetica", "normal")
      .setFontSize(7.5)
      .text(
        [
          "Ruko Bisnis Grand Royal Blok A No. 38",
          "Jl. Boulevard Permata Raya Taman Royal 1 Cipondoh - Kota Tangerang",
          "Telp : (021) 2950 5617 (Hunting) | E-mail : moikoina@gmail.com",
        ],
        (L + 110 + R) / 2,
        49,
        { align: "center", lineHeightFactor: 1.3 }
      );

    doc.setLineWidth(1.2).rect(L, 88, R - L, 20).rect(L, 108, R - L, 64);
    doc
      .setFont("helvetica", "bold")
      .setFontSize(11)
      .text("BUKTI PELAKSANAAN PEKERJAAN", W / 2, 102, { align: "center" });

    drawField(L + 8, "NAMA PELANGGAN", L + 84, 290, r.customer, 124);
    drawField(L + 8, "ALAMAT", L + 84, 290, r.address.slice(0, 48), 138);
    drawField(L + 8, "", L + 84, 290, r.address.slice(48), 152);
    drawField(L + 8, "HARI / TGL", L + 84, 290, formatDateId(r.date), 166);

    drawField(318, "NAMA PETUGAS", 390, R - 8, r.officer, 124);
    drawField(318, "", 390, R - 8, "", 138);
    drawField(318, "WAKTU DATANG", 390, R - 8, r.arrivalTime, 152);
    drawField(318, "WAKTU PULANG", 390, R - 8, r.departureTime, 166);

    // Pre-rasterize room signatures
    const sigMap: Record<string, string> = {};
    for (const fl of r.floors) {
      for (const rm of fl.rooms) {
        if (rm.signature) {
          sigMap[rm.id] = await toRasterDataUrl(rm.signature);
        }
      }
    }

    const tableBody: unknown[][] = [];
    for (const fl of r.floors) {
      tableBody.push([
        "",
        { content: fl.name, colSpan: 17, styles: { halign: "left", fontStyle: "bold" } },
      ]);
      fl.rooms.forEach((rm, j) => {
        tableBody.push([
          j === 0 ? fl.no : "",
          { content: rm.name, styles: { halign: "left" } },
          ...rm.methods.map((v) => (v ? "v" : "")),
          ...rm.pests.map((v) => (v === "0" || v === "" ? "" : v)),
          rm.photos.length ? String(rm.photos.length) : "",
          { content: "", sigUrl: sigMap[rm.id] || "" },
        ]);
      });
    }
    while (tableBody.length < 18) {
      tableBody.push(Array(19).fill(""));
    }

    autoTable(doc, {
      startY: 172,
      theme: "grid",
      margin: { left: L, right: L },
      tableWidth: R - L,
      body: tableBody as never,
      head: [
        [
          { content: "NO.", rowSpan: 2 },
          { content: "AREA / LOKASI", rowSpan: 2 },
          { content: "METODE TREATMENT", colSpan: 6 },
          { content: "TEMUAN HAMA", colSpan: 9 },
          { content: "DOK.", rowSpan: 2 },
          { content: "PARAF", rowSpan: 2 },
        ],
        [
          ...METHODS.map((m) => m.code),
          ...PESTS.map(() => ({ content: "", styles: { minCellHeight: 58 } })),
        ],
      ],
      styles: {
        fontSize: 7.5,
        cellPadding: 1,
        halign: "center",
        valign: "middle",
        lineColor: [40, 40, 40],
        lineWidth: 0.5,
        textColor: 0,
        minCellHeight: 16,
      },
      headStyles: {
        fillColor: 255,
        textColor: 0,
        fontSize: 7.5,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 120, halign: "left" },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22 },
        5: { cellWidth: 22 },
        6: { cellWidth: 22 },
        7: { cellWidth: 22 },
        8: { cellWidth: 19 },
        9: { cellWidth: 19 },
        10: { cellWidth: 19 },
        11: { cellWidth: 19 },
        12: { cellWidth: 19 },
        13: { cellWidth: 19 },
        14: { cellWidth: 19 },
        15: { cellWidth: 19 },
        16: { cellWidth: 19 },
        17: { cellWidth: 32 },
        18: { cellWidth: 68 },
      },
      didDrawCell: (data) => {
        const raw = data.cell.raw as { sigUrl?: string } | undefined;
        if (
          data.section === "body" &&
          data.column.index === 18 &&
          raw?.sigUrl
        ) {
          const h = data.cell.height - 2;
          const w = h * 2.57;
          try {
            doc.addImage(
              raw.sigUrl,
              "PNG",
              data.cell.x + (data.cell.width - w) / 2,
              data.cell.y + 1,
              w,
              h
            );
          } catch {
            // ignore invalid image
          }
        }
        if (
          data.section === "head" &&
          data.row.index === 1 &&
          data.column.index >= 8 &&
          data.column.index <= 16
        ) {
          doc
            .setFontSize(6)
            .setFont("helvetica", "normal")
            .text(
              PESTS[data.column.index - 8],
              data.cell.x + data.cell.width / 2 + 2,
              data.cell.y + data.cell.height - 3,
              { angle: 90 }
            );
        }
      },
    });

    const tableFinalY =
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY || 520;
    let y = tableFinalY + 10;
    if (y > 640) {
      doc.addPage();
      y = 40;
    }

    doc
      .setFontSize(7.5)
      .setFont("helvetica", "bold")
      .text("Keterangan :", L, y)
      .setFont("helvetica", "normal")
      .text(
        "(S) Spray, (CF) Cold Fogger, (HF) Hot Fogging, (BT) Baiting, (PJ) Perangkap/Jebakan, (TB) Tabur",
        L + 46,
        y
      );

    y += 12;
    doc.setFont("helvetica", "bold").text("Penggunaan Chemical", L, y);

    autoTable(doc, {
      startY: y + 3,
      head: [["No", "Bahan Aktif", "Jml"]],
      body: r.chemicals.map((c, k) => [k + 1, c.activeIngredient, c.amount]),
      theme: "grid",
      tableWidth: 250,
      margin: { left: L },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        halign: "center",
        minCellHeight: 15,
        lineColor: [40, 40, 40],
        lineWidth: 0.5,
        textColor: 0,
      },
      headStyles: { fillColor: 255, textColor: 0 },
      columnStyles: { 0: { cellWidth: 28 }, 2: { cellWidth: 50 } },
    });

    const y2 =
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY || y + 90;

    doc.setLineWidth(1).rect(300, y + 3, R - 300, y2 - y - 3);
    doc.setFont("helvetica", "bold").text("Catatan :", 306, y + 14);
    doc
      .setFont("helvetica", "normal")
      .text(doc.splitTextToSize(r.notes || "", R - 316), 306, y + 26);

    let sy = y2 + 22;
    if (sy > 720) {
      doc.addPage();
      sy = 50;
    }

    const sigMeta: Array<[string, string, string, string]> = [
      ["Penanggung Jawab Pekerjaan", "MOIKO", M.pjName, M.pjImg],
      ["Pengawas Pekerjaan", "CUSTOMER", M.pwName, M.pwImg],
      ["Diketahui & Disetujui", "CUSTOMER", M.dkName, M.dkImg],
    ];

    for (let c = 0; c < sigMeta.length; c++) {
      const [line1, line2, name, imgData] = sigMeta[c];
      const x = L + ((c * 2 + 1) * (R - L)) / 6;
      doc
        .setFontSize(8)
        .setFont("helvetica", "normal")
        .text([line1, line2], x, sy, { align: "center" });
      if (imgData) {
        const raster = await toRasterDataUrl(imgData);
        if (raster) {
          try {
            doc.addImage(raster, "JPEG", x - 40, sy + 14, 80, 48);
          } catch {
            // ignore
          }
        }
      }
      doc
        .setLineDashPattern([1, 1.5], 0)
        .line(x - 70, sy + 74, x + 70, sy + 74);
      doc.setLineDashPattern([], 0);
      doc.text(name || "", x, sy + 71, { align: "center" });
    }

    // Documentation photo pages
    const photos: Array<[string, string]> = [];
    r.floors.forEach((f) =>
      f.rooms.forEach((rm) =>
        rm.photos.forEach((p) =>
          photos.push([p, `${f.name} - ${rm.name || "Ruangan"}`])
        )
      )
    );

    if (photos.length > 0) {
      photos.forEach((p, pIdx) => {
        if (pIdx % 6 === 0) {
          doc.addPage();
          doc
            .setFont("helvetica", "bold")
            .setFontSize(11)
            .text(
              `DOKUMENTASI KEGIATAN - ${formatDateId(r.date)} - ${r.customer}`,
              24,
              36
            );
        }
        const k = pIdx % 6;
        const px = 24 + (k % 2) * ((W - 48) / 2);
        const py = 50 + Math.floor(k / 2) * 250;
        const bw = (W - 48) / 2 - 12;
        const bh = 205;
        try {
          const props = doc.getImageProperties(p[0]);
          const scale = Math.min(bw / props.width, bh / props.height);
          doc.addImage(
            p[0],
            "JPEG",
            px,
            py,
            props.width * scale,
            props.height * scale
          );
          doc
            .setFont("helvetica", "normal")
            .setFontSize(8)
            .text(doc.splitTextToSize(p[1], bw), px, py + bh + 10);
        } catch {
          // ignore
        }
      });
    }
  }

  downloadBlob(doc.output("blob"), filename);
}

export function exportReportsXlsx(
  reports: Report[],
  months: Record<string, MonthApproval>,
  filename: string
): void {
  if (!reports.length) return;

  const wb = XLSX.utils.book_new();
  const detailHeader = [
    "No",
    "Area / Lokasi",
    ...METHODS.map((m) => m.code),
    ...PESTS,
    "Dokumentasi",
    "Paraf",
  ];

  const rekapRows: (string | number)[][] = [
    [
      "Tanggal",
      "Pelanggan",
      "Petugas",
      "Waktu Datang",
      "Waktu Pulang",
      "Lantai",
      "Ruangan",
      ...METHODS.map((m) => m.code),
      ...PESTS,
      "Total Temuan",
      "Jml Foto",
      "Paraf",
      "Penggunaan Chemical",
      "Catatan Lapangan",
    ],
  ];

  const pestTotals = PESTS.map(() => 0);
  let grandTotalPests = 0;

  reports.forEach((r) => {
    const chemSummary = r.chemicals
      .filter((c) => c.activeIngredient.trim())
      .map((c) => `${c.activeIngredient} (${c.amount || "-"})`)
      .join("; ");

    const sheetRows: (string | number)[][] = [
      ["PT. MOIKO MITSUBA INDONESIA"],
      ["BUKTI PELAKSANAAN PEKERJAAN"],
      ["Nama Pelanggan", r.customer, "", "", "Nama Petugas", r.officer],
      ["Alamat", r.address, "", "", "Waktu Datang", r.arrivalTime],
      ["Hari / Tgl", formatDateId(r.date), "", "", "Waktu Pulang", r.departureTime],
      [],
      detailHeader,
    ];

    r.floors.forEach((f) => {
      sheetRows.push([f.no, f.name]);
      f.rooms.forEach((rm) => {
        const roomTotal = sumRoomPests(rm);
        rm.pests.forEach((v, idx) => {
          const val = parseInt(v, 10) || 0;
          pestTotals[idx] += val;
        });
        grandTotalPests += roomTotal;

        sheetRows.push([
          "",
          rm.name,
          ...rm.methods.map((v) => (v ? "v" : "")),
          ...rm.pests.map((v) => (v === "" || v === "0" ? "" : Number(v) || v)),
          rm.photos.length ? `${rm.photos.length} foto` : "",
          rm.signature ? "Sudah" : "",
        ]);

        rekapRows.push([
          formatDateId(r.date),
          r.customer,
          r.officer,
          r.arrivalTime,
          r.departureTime,
          f.name,
          rm.name,
          ...rm.methods.map((v) => (v ? "v" : "")),
          ...rm.pests.map((v) => (v === "" ? 0 : Number(v) || 0)),
          roomTotal,
          rm.photos.length,
          rm.signature ? "Sudah" : "Belum",
          chemSummary,
          r.notes,
        ]);
      });
    });

    sheetRows.push([], ["Penggunaan Chemical", "Bahan Aktif", "Jml"]);
    r.chemicals.forEach((c, i) =>
      sheetRows.push([i + 1, c.activeIngredient, c.amount])
    );
    sheetRows.push([], ["Catatan", r.notes]);

    const M = months[getMonthKey(r.date)] || createEmptyApproval();
    sheetRows.push(
      [],
      [
        "Penanggung Jawab MOIKO",
        M.pjName,
        "",
        "Pengawas CUSTOMER",
        M.pwName,
        "",
        "Disetujui CUSTOMER",
        M.dkName,
      ]
    );

    const ws = XLSX.utils.aoa_to_sheet(sheetRows);
    ws["!cols"] = [{ wch: 8 }, { wch: 30 }];
    const sheetName = formatDateId(r.date).slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // Add TOTAL row at bottom of Rekap Bulan sheet
  rekapRows.push([
    "TOTAL",
    "",
    "",
    "",
    "",
    "",
    "",
    ...METHODS.map(() => ""),
    ...pestTotals,
    grandTotalPests,
    "",
    "",
    "",
    "",
  ]);

  const rekapSheet = XLSX.utils.aoa_to_sheet(rekapRows);
  rekapSheet["!cols"] = [
    { wch: 12 },
    { wch: 24 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
    { wch: 24 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, rekapSheet, "Rekap Lengkap");
  wb.SheetNames.unshift(wb.SheetNames.pop() as string);

  const arr = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  downloadBlob(
    new Blob([arr], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename
  );
}
