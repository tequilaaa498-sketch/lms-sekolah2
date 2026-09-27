import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  pengumpulan: z.array(
    z.object({
      id: z.string(),
      nilai: z.number().min(0).max(100).nullable(),
    })
  ),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "GURU") {
    return NextResponse.json({ message: "Tidak diizinkan." }, { status: 401 });
  }
  const { id } = await params;

  const tugas = await prisma.tugas.findFirst({
    where: { id, guruId: session.userId },
  });
  if (!tugas) {
    return NextResponse.json({ message: "Tugas tidak ditemukan." }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.pengumpulan.map((p) =>
      prisma.pengumpulanTugas.update({
        where: { id: p.id },
        data: { nilai: p.nilai },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
