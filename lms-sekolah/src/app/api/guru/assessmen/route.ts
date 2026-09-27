import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  judul: z.string().min(1),
  tipe: z.enum(["KUIS", "UJIAN"]),
  kelasId: z.string().min(1),
  mataPelajaranId: z.string().min(1),
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
  const { judul, tipe, kelasId, mataPelajaranId } = parsed.data;

  const siswaKelas = await prisma.siswa.findMany({ where: { kelasId } });

  const assessmen = await prisma.assessmen.create({
    data: {
      judul,
      tipe,
      kelasId,
      mataPelajaranId,
      guruId: session.userId,
      hasil: {
        create: siswaKelas.map((s) => ({ siswaId: s.id })),
      },
    },
  });

  return NextResponse.json({ id: assessmen.id });
}
