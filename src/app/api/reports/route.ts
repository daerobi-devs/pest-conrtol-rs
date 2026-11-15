import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/daeroom";
import { Report } from "@/types/report";

interface DbReportRow {
  id: string;
  date: string;
  customer: string;
  address: string | null;
  officer: string;
  arrival_time: string | null;
  departure_time: string | null;
  floors: unknown;
  chemicals: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToReport(row: DbReportRow): Report {
  return {
    id: row.id,
    date: row.date,
    customer: row.customer,
    address: row.address || "",
    officer: row.officer,
    arrivalTime: row.arrival_time || "08:00",
    departureTime: row.departure_time || "16:00",
    floors: Array.isArray(row.floors)
      ? (row.floors as Report["floors"])
      : typeof row.floors === "string"
      ? JSON.parse(row.floors)
      : [],
    chemicals: Array.isArray(row.chemicals)
      ? (row.chemicals as Report["chemicals"])
      : typeof row.chemicals === "string"
      ? JSON.parse(row.chemicals)
      : [],
    notes: row.notes || "",
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    let sql =
      "SELECT id, date, customer, address, officer, arrival_time, departure_time, floors, chemicals, notes, created_at, updated_at FROM reports";
    const params: unknown[] = [];

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      sql += " WHERE date LIKE $1 ORDER BY date ASC";
      params.push(`${month}%`);
    } else {
      sql += " ORDER BY date ASC";
    }

    const result = await queryDb<DbReportRow>(sql, params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const reports = (result.rows || []).map(mapRowToReport);
    return NextResponse.json({ success: true, reports });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Report;

    if (!body || !body.id || !body.date) {
      return NextResponse.json(
        { success: false, error: "Field id dan date wajib diisi." },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO reports (id, date, customer, address, officer, arrival_time, departure_time, floors, chemicals, notes, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
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
        updated_at = NOW()
    `;

    const params = [
      body.id,
      body.date,
      body.customer || "RSU Kota Tangerang Selatan",
      body.address || "",
      body.officer || "Petugas Lapangan",
      body.arrivalTime || "08:00",
      body.departureTime || "16:00",
      JSON.stringify(body.floors || []),
      JSON.stringify(body.chemicals || []),
      body.notes || "",
    ];

    const result = await queryDb(sql, params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: body.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Parameter id wajib diisi." },
        { status: 400 }
      );
    }

    const sql = "DELETE FROM reports WHERE id = $1";
    const result = await queryDb(sql, [id]);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
