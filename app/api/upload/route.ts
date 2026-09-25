import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// ====================================================================
// PENTING: implementasi ini nulis file ke /public/uploads di disk lokal.
// Ini CUMA JALAN di local dev (npm run dev / Laragon). Vercel serverless
// filesystem-nya read-only saat runtime -- file yang ditulis di sini
// GAK BAKAL PERSISTEN begitu di-deploy ke Vercel. Ganti pakai Vercel Blob
// sebelum deploy production (lihat catatan lama di komentar bawah).
// ====================================================================

const MAX_SIZE_MB = 10; // dinaikin dari 5 -> 10, jawaban tugas siswa bisa lebih besar (scan PDF dsb)
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = ["application/pdf"];
const ALLOWED_TUGAS_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOC_TYPES,
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/zip",
];

// kategori nentuin subfolder + validasi tipe file apa yang diterima
const KATEGORI_CONFIG: Record<string, { folder: string; allowedTypes: string[] }> = {
  profil: { folder: "profil", allowedTypes: ALLOWED_IMAGE_TYPES },
  materi: { folder: "materi", allowedTypes: ALLOWED_DOC_TYPES },
  pengumuman: { folder: "pengumuman", allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES] },
  tugas: { folder: "tugas", allowedTypes: ALLOWED_TUGAS_TYPES }, // baru -- jawaban siswa (file/pdf/docx/dsb)
};

// POST /api/upload -> multipart/form-data, field: "file", query: ?kategori=profil|materi|pengumuman|tugas
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const kategori = req.nextUrl.searchParams.get("kategori") ?? "profil";
    const config = KATEGORI_CONFIG[kategori];
    if (!config) {
      return NextResponse.json({ error: "Kategori upload tidak valid." }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File wajib diisi." }, { status: 400 });
    }

    if (!config.allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak diizinkan. Yang diterima: ${config.allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      return NextResponse.json({ error: `Ukuran file maksimal ${MAX_SIZE_MB}MB.` }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || (file.type === "application/pdf" ? "pdf" : "jpg");
    const filename = `${crypto.randomUUID()}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", config.folder);
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${config.folder}/${filename}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Gagal upload file." }, { status: 500 });
  }
}