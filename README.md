# pest-conrtol-rs

Sistem Pelaporan dan Pencatatan Pengendalian Vektor (Pest Control) Digital untuk **RSU Kota Tangerang Selatan** bekerjasama dengan **PT. Moiko Mitsuba Indonesia**.

## Fitur Utama
- **Input Lapangan Mobile-First**: Form inspeksi ramah jempol untuk petugas di area rumah sakit tanpa tabel horizontal panjang.
- **Preview Lembar Kerja Resmi**: Tampilan akurat format kertas PT. Moiko Mitsuba Indonesia siap cetak.
- **Digital Signature & Photo Evidence**: Paraf layar sentuh per ruangan dan upload dokumentasi foto ke MinIO S3.
- **Live Rekap Bulanan**: Monitoring rekapitulasi data temuan hama dan status paraf secara realtime.
- **Export Native Browser**: Unduh laporan harian & rekap bulanan ke format PDF (A4) dan Excel (`.xlsx`) langsung tanpa dependensi sandbox.
- **Daeroom Cloud Integration**: Penyimpanan terpusat ke database PostgreSQL `db_pest_control_rs` dan MinIO S3 bucket `pest-control-rs-assets`.
- **Tema Terang Default**: Desain clean medical white mode standar rumah sakit dengan opsi Dark Mode.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Standalone Output) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide React
- **Backend & Database**: Daeroom Cloud (PostgreSQL on Proxmox VE 9 CT 105 via API Gateway)
- **Object Storage**: MinIO S3 Bucket `pest-control-rs-assets`
- **Export Engines**: `jspdf`, `jspdf-autotable`, `xlsx`
- **Containerization**: Multi-stage lightweight Docker image (`node:22-alpine`)

## Konfigurasi Lingkungan (.env.local)
```env
DAEROOM_URL="https://apiv1.daeroom.my.id"
DAEROOM_API_KEY="your_api_key_here"
DAEROOM_READONLY_KEY="your_readonly_key_here"
NEXT_PUBLIC_S3_URL="https://s3.daeroom.my.id"
DAEROOM_S3_BUCKET="pest-control-rs-assets"
```

## Menjalankan Proyek Secara Lokal

```bash
# Install dependencies
npm install

# Inisialisasi skema tabel & data seed (opsional)
node --env-file=.env.local scripts/init-db.mjs
node --env-file=.env.local scripts/seed-db.mjs

# Development server
npm run dev

# Production build
npm run build
npm run start
```

## Docker Deployment (Coolify / VPS)
Aplikasi ini sudah dikonfigurasi dengan `output: "standalone"` di `next.config.ts` dan Dockerfile multi-stage berukuran sangat ringan (~120MB).

```bash
# Build Docker image
docker build -t pest-control-rs .

# Run container
docker run -p 3000:3000 --env-file .env.local pest-control-rs
```
