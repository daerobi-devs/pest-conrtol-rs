export const METHODS = [
  { code: "S", label: "Spray" },
  { code: "CF", label: "Cold Fogger" },
  { code: "HF", label: "Hot Fogging" },
  { code: "BT", label: "Baiting" },
  { code: "PJ", label: "Perangkap / Jebakan" },
  { code: "TB", label: "Tabur" },
] as const;

export const PESTS = [
  "Jentik",
  "Nyamuk",
  "Lalat",
  "Semut",
  "Kecoa Amerika",
  "Kecoa German",
  "Tikus",
  "Tomcat",
  "Hama lain",
] as const;

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export interface RoomEntry {
  id: string;
  name: string;
  /** 6 flags corresponding to METHODS (0 or 1) */
  methods: number[];
  /** 9 numeric string counts corresponding to PESTS */
  pests: string[];
  /** Up to 4 compressed dataURL images */
  photos: string[];
  /** Signature dataURL PNG */
  signature: string;
}

export interface FloorEntry {
  id: string;
  no: string;
  name: string;
  rooms: RoomEntry[];
}

export interface ChemicalEntry {
  activeIngredient: string;
  amount: string;
}

export interface Report {
  id: string;
  date: string; // YYYY-MM-DD
  customer: string;
  address: string;
  officer: string;
  arrivalTime: string; // HH:mm
  departureTime: string; // HH:mm
  floors: FloorEntry[];
  chemicals: ChemicalEntry[];
  notes: string;
  updatedAt: string;
}

export interface MonthApproval {
  pjName: string;
  pwName: string;
  dkName: string;
  pjImg: string;
  pwImg: string;
  dkImg: string;
}

export interface AppDataState {
  reports: Report[];
  months: Record<string, MonthApproval>;
}

export type ActiveTab = "overview" | "editor" | "rekap" | "approvals";

export type DemoRole = {
  id: string;
  name: string;
  role: "admin" | "officer";
  title: string;
};

export const DEMO_ROLES: DemoRole[] = [
  {
    id: "admin-fanny",
    name: "Fanny Fadlilah",
    role: "admin",
    title: "Pengawas / Admin RS",
  },
];
