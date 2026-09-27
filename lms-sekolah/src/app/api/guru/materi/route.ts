import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  judul: z.string().min(1),
  kelasId: z.string().min(1),
  mataPelajaranId: z.string().min(1),
  tipe: z.enum(["PDF", "LINK"]),
  isi: z.string().min(1),
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

  const materi = await prisma.materi.create({
    data: { ...parsed.data, guruId: session.userId },
  });

  return NextResponse.json({ id: materi.id });
}
