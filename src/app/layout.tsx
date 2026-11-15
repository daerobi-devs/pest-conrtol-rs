import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    default: "VektorOps — Pelaporan Pest Control RSU Kota Tangerang Selatan",
    template: "%s | VektorOps RSU Tangsel",
  },
  description:
    "Sistem pelaporan digital, bukti pelaksanaan pekerjaan, dan rekapitulasi pengendalian vektor PT. Moiko Mitsuba Indonesia untuk RSU Kota Tangerang Selatan.",
  applicationName: "VektorOps Pest Control",
  keywords: [
    "Pest Control",
    "Pengendalian Vektor",
    "RSU Kota Tangerang Selatan",
    "PT Moiko Mitsuba Indonesia",
    "Laporan Sanitasi RS",
    "VektorOps",
  ],
  authors: [{ name: "PT. Moiko Mitsuba Indonesia" }],
  creator: "PT. Moiko Mitsuba Indonesia",
  publisher: "RSU Kota Tangerang Selatan",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "VektorOps — PT. Moiko Mitsuba Indonesia",
    title: "VektorOps — Pelaporan Pest Control RSU Kota Tangerang Selatan",
    description:
      "Sistem pelaporan digital & rekapitulasi bukti pelaksanaan pekerjaan pengendalian vektor PT. Moiko Mitsuba Indonesia untuk RSU Kota Tangerang Selatan.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VektorOps - Sistem Pelaporan Pest Control RSU Kota Tangerang Selatan",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VektorOps — Pelaporan Pest Control RSU Kota Tangerang Selatan",
    description:
      "Sistem pelaporan digital & rekapitulasi bukti pelaksanaan pekerjaan pengendalian vektor PT. Moiko Mitsuba Indonesia untuk RSU Kota Tangerang Selatan.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans selection:bg-rose-500/20 selection:text-rose-700">
        {children}
      </body>
    </html>
  );
}
