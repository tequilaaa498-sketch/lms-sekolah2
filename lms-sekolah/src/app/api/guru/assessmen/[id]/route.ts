import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  hasil: z.array(
    z.object({
      id: z.string(),
      sudahKerjakan: z.boolean(),
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

  const assessmen = await prisma.assessmen.findFirst({
    where: { id, guruId: session.userId },
  });
  if (!assessmen) {
    return NextResponse.json({ message: "Assessmen tidak ditemukan." }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Data tidak valid." }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.hasil.map((h) =>
      prisma.hasilAssessmen.update({
        where: { id: h.id },
        data: { sudahKerjakan: h.sudahKerjakan, nilai: h.nilai },
      })
    )
  );

  const semuaSudahDinilai = parsed.data.hasil.every((h) => h.nilai != null);
  await prisma.assessmen.update({
    where: { id },
    data: {
      statusPenilaian: semuaSudahDinilai ? "SELESAI_DINILAI" : "PERLU_DINILAI",
    },
  });

  return NextResponse.json({ ok: true });
}
