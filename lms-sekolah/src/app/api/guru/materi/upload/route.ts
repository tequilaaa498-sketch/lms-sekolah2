import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "GURU") {
    return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File tidak ditemukan." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ message: "File harus berformat PDF." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const namaFileAman = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "materi");
  await writeFile(path.join(uploadDir, namaFileAman), bytes);

  return NextResponse.json({ url: `/uploads/materi/${namaFileAman}` });
}
