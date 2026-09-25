import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

// POST /api/tugas/[id]/submit -> siswa kumpulin/update jawaban tugas.
// SENGAJA cuma nerima lampiran (file/pdf/link) -- gak ada field teks sama sekali.
// Bisa dipanggil ulang buat ganti lampiran (upsert, replace semua lampiran lama).
// body: { lampiran: [{ tipe: FILE|LINK, url, judul? }] }
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    requireRole(session, ["SISWA"]);

    const { id: tugasId } = await params;
    const body = await req.json();
    const { lampiran } = body;

    if (!Array.isArray(lampiran) || lampiran.length === 0) {
      return NextResponse.json({ error: "Lampirkan minimal 1 file/link untuk mengumpulkan tugas." }, { status: 400 });
    }

    const tugas = await db.tugas.findUnique({
      where: { id: tugasId },
      include: { kelasTujuan: { select: { kelasId: true } } },
    });
    if (!tugas) return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });

    const kelasIdTujuan = tugas.kelasTujuan.map((tk) => tk.kelasId);
    const isAnggota = await db.kelasSiswa.findFirst({
      where: { siswaId: session!.userId, kelasId: { in: kelasIdTujuan } },
    });
    if (!isAnggota) {
      return NextResponse.json({ error: "Anda tidak memiliki akses ke tugas ini." }, { status: 403 });
    }

    const submission = await db.$transaction(async (tx) => {
      const sub = await tx.tugasSubmission.upsert({
        where: { tugasId_siswaId: { tugasId, siswaId: session!.userId } },
        update: { status: "SUDAH", submittedAt: new Date() },
        create: { tugasId, siswaId: session!.userId, status: "SUDAH", submittedAt: new Date() },
      });

      // replace semua lampiran lama (buat skenario edit/re-submit)
      await tx.lampiranTugasSubmission.deleteMany({ where: { submissionId: sub.id } });
      await tx.lampiranTugasSubmission.createMany({
        data: lampiran.map((l: { tipe: string; url: string; judul?: string }) => ({
          submissionId: sub.id,
          tipe: l.tipe,
          url: l.url,
          judul: l.judul || null,
        })),
      });

      return sub;
    });

    return NextResponse.json({ message: "Tugas berhasil dikumpulkan.", data: submission });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}