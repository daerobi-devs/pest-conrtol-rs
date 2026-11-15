import { NextRequest, NextResponse } from "next/server";
import { queryDb } from "@/lib/daeroom";
import { MonthApproval } from "@/types/report";

interface DbApprovalRow {
  month_key: string;
  pj_name: string | null;
  pw_name: string | null;
  dk_name: string | null;
  pj_img: string | null;
  pw_img: string | null;
  dk_img: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (month) {
      const sql =
        "SELECT month_key, pj_name, pw_name, dk_name, pj_img, pw_img, dk_img FROM month_approvals WHERE month_key = $1";
      const result = await queryDb<DbApprovalRow>(sql, [month]);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      const row = result.rows?.[0];
      const approval: MonthApproval = {
        pjName: row?.pj_name || "",
        pwName: row?.pw_name || "",
        dkName: row?.dk_name || "",
        pjImg: row?.pj_img || "",
        pwImg: row?.pw_img || "",
        dkImg: row?.dk_img || "",
      };

      return NextResponse.json({ success: true, month, approval });
    }

    // Return all months approvals
    const sql =
      "SELECT month_key, pj_name, pw_name, dk_name, pj_img, pw_img, dk_img FROM month_approvals ORDER BY month_key DESC";
    const result = await queryDb<DbApprovalRow>(sql);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const months: Record<string, MonthApproval> = {};
    for (const r of result.rows || []) {
      months[r.month_key] = {
        pjName: r.pj_name || "",
        pwName: r.pw_name || "",
        dkName: r.dk_name || "",
        pjImg: r.pj_img || "",
        pwImg: r.pw_img || "",
        dkImg: r.dk_img || "",
      };
    }

    return NextResponse.json({ success: true, months });
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
    const body = (await req.json()) as {
      monthKey: string;
      approval: MonthApproval;
    };

    if (!body || !body.monthKey || !body.approval) {
      return NextResponse.json(
        { success: false, error: "monthKey dan approval wajib disertakan." },
        { status: 400 }
      );
    }

    const { monthKey, approval } = body;
    const sql = `
      INSERT INTO month_approvals (month_key, pj_name, pw_name, dk_name, pj_img, pw_img, dk_img, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (month_key) DO UPDATE SET
        pj_name = EXCLUDED.pj_name,
        pw_name = EXCLUDED.pw_name,
        dk_name = EXCLUDED.dk_name,
        pj_img = EXCLUDED.pj_img,
        pw_img = EXCLUDED.pw_img,
        dk_img = EXCLUDED.dk_img,
        updated_at = NOW()
    `;

    const params = [
      monthKey,
      approval.pjName || "",
      approval.pwName || "",
      approval.dkName || "",
      approval.pjImg || "",
      approval.pwImg || "",
      approval.dkImg || "",
    ];

    const result = await queryDb(sql, params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, monthKey });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
