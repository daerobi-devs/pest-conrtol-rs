import { queryDb } from "../src/lib/daeroom.ts";

async function main() {
  console.log("Setting up tables in db_pest_control_rs...");

  const schema = `
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      customer TEXT NOT NULL,
      address TEXT,
      officer TEXT NOT NULL,
      arrival_time TEXT,
      departure_time TEXT,
      floors JSONB NOT NULL DEFAULT '[]'::jsonb,
      chemicals JSONB NOT NULL DEFAULT '[]'::jsonb,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS month_approvals (
      month_key TEXT PRIMARY KEY,
      pj_name TEXT,
      pw_name TEXT,
      dk_name TEXT,
      pj_img TEXT,
      pw_img TEXT,
      dk_img TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
  `;

  const res = await queryDb(schema);
  console.log("Schema creation result:", res);

  const check = await queryDb(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  console.log("Current public tables:", check.rows);
}

main().catch(console.error);
