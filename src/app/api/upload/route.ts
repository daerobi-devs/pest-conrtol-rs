import { NextRequest, NextResponse } from "next/server";
import { daeroomStorage } from "@/lib/daeroom";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const path = formData.get("path");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan dalam request form-data." },
        { status: 400 }
      );
    }

    const customPath = typeof path === "string" ? path : undefined;
    const result = await daeroomStorage.upload(file, customPath);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal mengunggah file ke S3." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      name: result.name,
      url: result.url,
      size: result.size,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
