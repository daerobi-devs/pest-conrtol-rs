import {
  AppDataState,
  FloorEntry,
  MONTH_NAMES,
  MonthApproval,
  PESTS,
  Report,
  RoomEntry,
} from "@/types/report";

export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getMonthKey(dateStr: string): string {
  return (dateStr || "").slice(0, 7);
}

export function formatMonthName(monthKey: string): string {
  if (!monthKey || monthKey.length < 7) return "-";
  const year = monthKey.slice(0, 4);
  const monthIdx = Number(monthKey.slice(5, 7)) - 1;
  return `${MONTH_NAMES[monthIdx] || monthKey} ${year}`;
}

export function formatDateId(dateStr: string): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function createEmptyRoom(name = ""): RoomEntry {
  return {
    id: uid("rm"),
    name,
    methods: [1, 0, 0, 0, 0, 0],
    pests: PESTS.map(() => ""),
    photos: [],
    signature: "",
  };
}

export function createEmptyFloor(index: number): FloorEntry {
  return {
    id: uid("fl"),
    no: String(index),
    name: `Lantai ${index}`,
    rooms: [createEmptyRoom()],
  };
}

export function createEmptyApproval(): MonthApproval {
  return {
    pjName: "",
    pwName: "",
    dkName: "",
    pjImg: "",
    pwImg: "",
    dkImg: "",
  };
}

export function createNewReport(
  monthKey?: string,
  officerName = "Ahmad Fauzi",
  templateFrom?: Report
): Report {
  const today = new Date().toISOString().slice(0, 10);
  const targetDate =
    monthKey && monthKey !== today.slice(0, 7) ? `${monthKey}-01` : today;

  return {
    id: uid("rep"),
    date: targetDate,
    customer: templateFrom?.customer || "RSU Kota Tangerang Selatan",
    address:
      templateFrom?.address ||
      "Jl. Pajajaran No. 101, Pamulang Bar., Kota Tangerang Selatan",
    officer: officerName,
    arrivalTime: templateFrom?.arrivalTime || "08:00",
    departureTime: templateFrom?.departureTime || "15:30",
    floors: [createEmptyFloor(1)],
    chemicals: Array.from({ length: 5 }, () => ({
      activeIngredient: "",
      amount: "",
    })),
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

export function sumRoomPests(room: RoomEntry): number {
  return room.pests.reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
}

export function sumReportPests(report: Report): number {
  return report.floors.reduce(
    (fAcc, fl) =>
      fAcc + fl.rooms.reduce((rAcc, rm) => rAcc + sumRoomPests(rm), 0),
    0
  );
}

export function countReportRooms(report: Report): {
  total: number;
  named: number;
  signed: number;
  photos: number;
} {
  let total = 0;
  let named = 0;
  let signed = 0;
  let photos = 0;

  for (const fl of report.floors) {
    for (const rm of fl.rooms) {
      total += 1;
      if (rm.name.trim()) named += 1;
      if (rm.signature) signed += 1;
      photos += rm.photos.length;
    }
  }

  return { total, named, signed, photos };
}

export function compressImageFile(
  file: File,
  maxDim = 640,
  quality = 0.72
): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(null);
      img.src = String(reader.result);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// Simple clean sample signature SVG converted to data URL for realistic preview
const SAMPLE_SIG_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80"><path d="M18 55 C 32 22, 48 18, 52 52 C 56 64, 72 30, 88 38 C 96 42, 108 58, 128 45 C 145 34, 165 44, 198 36" fill="none" stroke="#111827" stroke-width="3" stroke-linecap="round"/></svg>`
  );

export function getInitialSeedData(): AppDataState {
  const monthKey = new Date().toISOString().slice(0, 7);
  const d1 = `${monthKey}-04`;
  const d2 = `${monthKey}-08`;
  const d3 = `${monthKey}-11`;

  return {
    reports: [
      {
        id: "rep-seed-1",
        date: d1,
        customer: "RSU Kota Tangerang Selatan",
        address: "Jl. Pajajaran No. 101, Pamulang Bar., Kota Tangerang Selatan",
        officer: "Ahmad Fauzi",
        arrivalTime: "08:05",
        departureTime: "15:10",
        floors: [
          {
            id: "fl-s1-1",
            no: "1",
            name: "Lantai 1 — Gedung Utama & IGD",
            rooms: [
              {
                id: "rm-s1-1",
                name: "R. Triase & Tindakan IGD",
                methods: [1, 0, 0, 1, 0, 0],
                pests: ["0", "1", "0", "2", "0", "0", "0", "0", "0"],
                photos: [],
                signature: SAMPLE_SIG_SVG,
              },
              {
                id: "rm-s1-2",
                name: "Toilet Pasien IGD",
                methods: [1, 0, 0, 0, 0, 1],
                pests: ["0", "2", "1", "0", "1", "0", "0", "0", "0"],
                photos: [],
                signature: SAMPLE_SIG_SVG,
              },
              {
                id: "rm-s1-3",
                name: "Instalasi Farmasi Utama",
                methods: [1, 0, 0, 1, 0, 0],
                pests: ["0", "0", "0", "3", "0", "0", "0", "0", "0"],
                photos: [],
                signature: SAMPLE_SIG_SVG,
              },
            ],
          },
          {
            id: "fl-s1-2",
            no: "2",
            name: "Lantai 2 — Poli & Pantry Gizi",
            rooms: [
              {
                id: "rm-s1-4",
                name: "Pantry & Dapur Gizi",
                methods: [1, 0, 0, 1, 1, 0],
                pests: ["0", "0", "2", "4", "0", "6", "0", "0", "0"],
                photos: [],
                signature: SAMPLE_SIG_SVG,
              },
              {
                id: "rm-s1-5",
                name: "Koridor Poli Penyakit Dalam",
                methods: [1, 0, 0, 0, 0, 0],
                pests: ["0", "1", "0", "0", "0", "0", "0", "0", "0"],
                photos: [],
                signature: "",
              },
            ],
          },
        ],
        chemicals: [
          { activeIngredient: "Cypermethrin 100 EC", amount: "120 ml" },
          { activeIngredient: "Fipronil Gel Bait 0.05%", amount: "20 gr" },
          { activeIngredient: "Temephos 1% SG", amount: "50 gr" },
          { activeIngredient: "", amount: "" },
          { activeIngredient: "", amount: "" },
        ],
        notes:
          "Ditemukan infestasi kecoa german di sela kabinet bawah sink Pantry Gizi. Sudah dilakukan gel baiting dan penyemprotan residual.",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rep-seed-2",
        date: d2,
        customer: "RSU Kota Tangerang Selatan",
        address: "Jl. Pajajaran No. 101, Pamulang Bar., Kota Tangerang Selatan",
        officer: "Dedi Kurniawan",
        arrivalTime: "08:30",
        departureTime: "14:45",
        floors: [
          {
            id: "fl-s2-1",
            no: "1",
            name: "Area Luar — IPAL, Taman & TPS B3",
            rooms: [
              {
                id: "rm-s2-1",
                name: "Bak Kontrol & Saluran IPAL",
                methods: [1, 1, 0, 0, 0, 1],
                pests: ["14", "9", "3", "0", "2", "0", "0", "0", "0"],
                photos: [],
                signature: SAMPLE_SIG_SVG,
              },
              {
                id: "rm-s2-2",
                name: "Area TPS Limbah Medis B3",
                methods: [1, 0, 1, 0, 1, 0],
                pests: ["0", "4", "7", "0", "1", "0", "2", "0", "0"],
                photos: [],
                signature: SAMPLE_SIG_SVG,
              },
            ],
          },
        ],
        chemicals: [
          { activeIngredient: "Deltamethrin 25 EC", amount: "150 ml" },
          { activeIngredient: "Bacillus thuringiensis", amount: "75 gr" },
          { activeIngredient: "Brodifacoum Rodent Bait", amount: "100 gr" },
          { activeIngredient: "", amount: "" },
          { activeIngredient: "", amount: "" },
        ],
        notes:
          "Larvasida ditaburkan pada genangan bak kontrol IPAL. Pemasangan bait station tikus di 2 titik belakang TPS B3.",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rep-seed-3",
        date: d3,
        customer: "RSU Kota Tangerang Selatan",
        address: "Jl. Pajajaran No. 101, Pamulang Bar., Kota Tangerang Selatan",
        officer: "Ahmad Fauzi",
        arrivalTime: "09:00",
        departureTime: "16:00",
        floors: [
          {
            id: "fl-s3-1",
            no: "3",
            name: "Lantai 3 — Rawat Inap Cempaka",
            rooms: [
              {
                id: "rm-s3-1",
                name: "Nurse Station & R. Obat",
                methods: [1, 0, 0, 1, 0, 0],
                pests: ["0", "0", "0", "1", "0", "0", "0", "0", "0"],
                photos: [],
                signature: SAMPLE_SIG_SVG,
              },
              {
                id: "rm-s3-2",
                name: "Kamar 301 - 304 & Spoelhoek",
                methods: [1, 0, 0, 0, 0, 0],
                pests: ["0", "1", "0", "0", "0", "1", "0", "0", "0"],
                photos: [],
                signature: SAMPLE_SIG_SVG,
              },
            ],
          },
        ],
        chemicals: [
          { activeIngredient: "Cypermethrin 100 EC", amount: "80 ml" },
          { activeIngredient: "Imidacloprid Gel Bait", amount: "10 gr" },
          { activeIngredient: "", amount: "" },
          { activeIngredient: "", amount: "" },
          { activeIngredient: "", amount: "" },
        ],
        notes:
          "Follow-up lantai 3 dalam kondisi terkendali. Tidak ada keluhan baru dari kepala ruangan.",
        updatedAt: new Date().toISOString(),
      },
    ],
    months: {
      [monthKey]: {
        pjName: "Hendra Wijaya",
        pwName: "Fanny Fadlilah",
        dkName: "dr. Ratna Sari, MARS",
        pjImg: "",
        pwImg: "",
        dkImg: "",
      },
    },
  };
}
