import { queryDb } from "../src/lib/daeroom.ts";

const SAMPLE_SIG_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80"><path d="M18 55 C 32 22, 48 18, 52 52 C 56 64, 72 30, 88 38 C 96 42, 108 58, 128 45 C 145 34, 165 44, 198 36" fill="none" stroke="#111827" stroke-width="3" stroke-linecap="round"/></svg>`
  );

async function main() {
  console.log("Checking if reports table is empty...");
  const countRes = await queryDb("SELECT COUNT(*)::int as count FROM reports");
  const count = countRes.rows?.[0]?.count ?? 0;

  if (count > 0) {
    console.log(`Database already contains ${count} reports. Skipping seed.`);
    return;
  }

  const monthKey = new Date().toISOString().slice(0, 7);
  const d1 = `${monthKey}-04`;
  const d2 = `${monthKey}-08`;
  const d3 = `${monthKey}-11`;

  const seedReports = [
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
  ];

  console.log("Inserting reports...");
  for (const r of seedReports) {
    await queryDb(
      `INSERT INTO reports (id, date, customer, address, officer, arrival_time, departure_time, floors, chemicals, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         date = EXCLUDED.date,
         customer = EXCLUDED.customer,
         address = EXCLUDED.address,
         officer = EXCLUDED.officer,
         arrival_time = EXCLUDED.arrival_time,
         departure_time = EXCLUDED.departure_time,
         floors = EXCLUDED.floors,
         chemicals = EXCLUDED.chemicals,
         notes = EXCLUDED.notes,
         updated_at = EXCLUDED.updated_at`,
      [
        r.id,
        r.date,
        r.customer,
        r.address,
        r.officer,
        r.arrivalTime,
        r.departureTime,
        JSON.stringify(r.floors),
        JSON.stringify(r.chemicals),
        r.notes,
        r.updatedAt,
      ]
    );
  }

  console.log("Inserting monthly approval...");
  await queryDb(
    `INSERT INTO month_approvals (month_key, pj_name, pw_name, dk_name, pj_img, pw_img, dk_img)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (month_key) DO UPDATE SET
       pj_name = EXCLUDED.pj_name,
       pw_name = EXCLUDED.pw_name,
       dk_name = EXCLUDED.dk_name,
       pj_img = EXCLUDED.pj_img,
       pw_img = EXCLUDED.pw_img,
       dk_img = EXCLUDED.dk_img,
       updated_at = NOW()`,
    [
      monthKey,
      "Hendra Wijaya",
      "Fanny Fadlilah",
      "dr. Ratna Sari, MARS",
      "",
      "",
      "",
    ]
  );

  console.log("Database seeded successfully!");
}

main().catch(console.error);
