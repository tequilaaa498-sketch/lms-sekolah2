import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

// POST /api/asesmen/[id]/pelanggaran -> dipanggil FE pas kedeteksi visibilitychange (pindah tab/keluar web)
// selama ngerjain. Reset SEPARUH jawaban PG/Checkbox yang UDAH kejawab (essay gak kena, dipilih random).
// Kalau kejadian lagi, reset lagi separuh dari SISA yang masih kejawab saat itu (progresif, gak ada hard-stop).
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    requireRole(session, ["SISWA"]);

    const { id: asesmenId } = await params;

    const submission = await db.submission.findUnique({
      where: { asesmenId_siswaId: { asesmenId, siswaId: session!.userId } },
      include: { jawaban: { include: { soal: true, opsiDipilih: true } } },
    });
    if (!submission) {
      return NextResponse.json({ error: "Anda belum memulai asesmen ini." }, { status: 404 });
    }
    if (submission.status === "SUDAH") {
      // udah kekumpul, gak ada yang perlu direset lagi
      return NextResponse.json({ message: "Asesmen sudah selesai.", jumlahDireset: 0 });
    }

    // "udah kejawab" = tipe bukan Essay DAN punya minimal 1 opsi yang dipilih
    const sudahKejawab = submission.jawaban.filter((j) => j.soal.tipe !== "ESSAY" && j.opsiDipilih.length > 0);
    const jumlahDireset = Math.floor(sudahKejawab.length / 2);

    if (jumlahDireset > 0) {
      const acak = [...sudahKejawab].sort(() => Math.random() - 0.5);
      const yangDireset = acak.slice(0, jumlahDireset);
      const idsToDelete = yangDireset.map((j) => j.id);

      await db.$transaction([
        db.jawabanOpsi.deleteMany({ where: { jawabanSiswaId: { in: idsToDelete } } }),
        db.jawabanSiswa.deleteMany({ where: { id: { in: idsToDelete } } }),
        db.submission.update({ where: { id: submission.id }, data: { tabSwitchCount: { increment: 1 } } }),
      ]);
    } else {
      await db.submission.update({ where: { id: submission.id }, data: { tabSwitchCount: { increment: 1 } } });
    }

    return NextResponse.json({ message: "Pelanggaran tercatat.", jumlahDireset });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}