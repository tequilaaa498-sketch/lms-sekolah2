import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  kelasId: z.string().min(1),
  mataPelajaranId: z.string().min(1),
});

function rataRataAngka(nilai: (number | null | undefined)[]) {
  const angka = nilai.filter((n): n is number => n != null);
  if (angka.length === 0) return null;
  return angka.reduce((a, b) => a + b, 0) / angka.length;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "GURU") {
    return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }
  const { kelasId, mataPelajaranId } = parsed.data;

  // Pastikan guru memang mengampu kombinasi kelas + mapel ini.
  const berhak = await prisma.guruMataPelajaran.findFirst({
    where: { guruId: session.userId, kelasId, mataPelajaranId },
  });
  if (!berhak) {
    return NextResponse.json(
      { message: "Kamu tidak mengampu kelas/mapel ini." },
      { status: 403 }
    );
  }

  const siswaList = await prisma.siswa.findMany({
    where: { kelasId },
    orderBy: { namaLengkap: "asc" },
  });

  const hasil = [];

  for (const siswa of siswaList) {
    const hasilAssessmen = await prisma.hasilAssessmen.findMany({
      where: {
        siswaId: siswa.id,
        assessmen: { kelasId, mataPelajaranId },
      },
      include: { assessmen: true },
    });
    const nilaiKuis = rataRataAngka(
      hasilAssessmen.filter((h) => h.assessmen.tipe === "KUIS").map((h) => h.nilai)
    );
    const nilaiUjian = rataRataAngka(
      hasilAssessmen.filter((h) => h.assessmen.tipe === "UJIAN").map((h) => h.nilai)
    );

    const pengumpulanTugas = await prisma.pengumpulanTugas.findMany({
      where: {
        siswaId: siswa.id,
        tugas: { kelasId, mataPelajaranId },
      },
    });
    const nilaiTugas = rataRataAngka(pengumpulanTugas.map((p) => p.nilai));

    const rataRata = rataRataAngka([nilaiKuis, nilaiUjian, nilaiTugas]);

    await prisma.nilai.upsert({
      where: { siswaId_mataPelajaranId: { siswaId: siswa.id, mataPelajaranId } },
      create: {
        siswaId: siswa.id,
        mataPelajaranId,
        nilaiKuis,
        nilaiUjian,
        nilaiTugas,
        rataRata,
      },
      update: { nilaiKuis, nilaiUjian, nilaiTugas, rataRata },
    });

    hasil.push({
      siswaId: siswa.id,
      siswaNama: siswa.namaLengkap,
      kuis: nilaiKuis,
      ujian: nilaiUjian,
      tugas: nilaiTugas,
      rataRata,
    });
  }

  return NextResponse.json({ hasil });
}
