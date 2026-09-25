import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireRole, ADMIN_TIER } from "@/lib/rbac";

// GET /api/asesmen?status=PROSES|SELESAI -> daftar asesmen milik guru yang login
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    requireRole(session, ["GURU", ...ADMIN_TIER]);

    const status = req.nextUrl.searchParams.get("status"); // optional filter

    const asesmenList = await db.asesmen.findMany({
      where: {
        guruId: session!.role === "GURU" ? session!.userId : undefined,
        status: status === "PROSES" || status === "SELESAI" ? status : undefined,
      },
      include: {
        mapel: true,
        kelasTujuan: { include: { kelas: { select: { id: true, judul: true } } } }, // kelasReferensi dihapus, pakai judul
        _count: { select: { soal: true, submission: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: asesmenList });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}

// POST /api/asesmen -> buat asesmen baru (status default PROSES, belum masuk ke kelas)
// body: { judul, tipe: KUIS|UJIAN, mapelId?, durasiMenit?, deskripsi?, kelasIds: string[] }
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    requireRole(session, ["GURU"]);

    const body = await req.json();
    const { judul, tipe, mapelId, durasiMenit, deskripsi, kelasIds } = body;

    if (!judul || !tipe || !Array.isArray(kelasIds) || kelasIds.length === 0) {
      return NextResponse.json(
        { error: "Judul, tipe, dan minimal 1 kelas tujuan wajib diisi." },
        { status: 400 }
      );
    }

    // TUGAS dihapus dari scope -- cuma KUIS & UJIAN
    if (!["KUIS", "UJIAN"].includes(tipe)) {
      return NextResponse.json({ error: "Tipe asesmen tidak valid." }, { status: 400 });
    }

    const asesmenBaru = await db.$transaction(async (tx) => {
      const asesmen = await tx.asesmen.create({
        data: {
          guruId: session!.userId,
          judul,
          tipe,
          mapelId: mapelId || null,
          durasiMenit: durasiMenit || null,
          deskripsi: deskripsi || null,
          status: "PROSES",
        },
      });

      await tx.asesmenKelas.createMany({
        data: kelasIds.map((kelasId: string) => ({ asesmenId: asesmen.id, kelasId })),
      });

      return asesmen;
    });

    return NextResponse.json({ message: "Asesmen berhasil dibuat.", data: asesmenBaru }, { status: 201 });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}