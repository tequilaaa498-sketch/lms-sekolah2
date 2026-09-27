import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  judul: z.string().min(1),
  deskripsi: z.string().optional(),
  kelasId: z.string().min(1),
  mataPelajaranId: z.string().min(1),
  batasKumpul: z.string().min(1), // ISO date string dari <input type="date">
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "GURU") {
    return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }
  const { judul, deskripsi, kelasId, mataPelajaranId, batasKumpul } = parsed.data;

  const siswaKelas = await prisma.siswa.findMany({ where: { kelasId } });

  const tugas = await prisma.tugas.create({
    data: {
      judul,
      deskripsi,
      kelasId,
      mataPelajaranId,
      guruId: session.userId,
      batasKumpul: new Date(batasKumpul),
      pengumpulan: {
        create: siswaKelas.map((s) => ({ siswaId: s.id })),
      },
    },
  });

  return NextResponse.json({ id: tugas.id });
}
