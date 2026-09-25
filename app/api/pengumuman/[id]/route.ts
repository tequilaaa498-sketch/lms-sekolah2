import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireRole, ADMIN_TIER } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    requireRole(session, ["GURU", "SISWA", ...ADMIN_TIER]);

    const { id } = await params;

    const pengumuman = await db.pengumuman.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, nama: true, fotoProfil: true, role: true } },
        lampiran: true,
      },
    });

    if (!pengumuman) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ data: pengumuman });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    requireRole(session, ["GURU"]);

    const { id } = await params;
    const body = await req.json();
    const { isi } = body;

    if (!isi) {
      return NextResponse.json({ error: "Isi wajib diisi." }, { status: 400 });
    }

    const existing = await db.pengumuman.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Pengumuman tidak ditemukan." }, { status: 404 });
    if (existing.authorId !== session!.userId) {
      return NextResponse.json({ error: "Bukan pengumuman milik anda." }, { status: 403 });
    }

    const updated = await db.pengumuman.update({
      where: { id },
      data: { isi },
      include: {
        author: { select: { id: true, nama: true, fotoProfil: true, role: true } },
        lampiran: true,
      },
    });

    return NextResponse.json({ message: "Berhasil diperbarui.", data: updated });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    requireRole(session, ["GURU"]);

    const { id } = await params;

    const existing = await db.pengumuman.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Pengumuman tidak ditemukan." }, { status: 404 });
    if (existing.authorId !== session!.userId) {
      return NextResponse.json({ error: "Bukan pengumuman milik anda." }, { status: 403 });
    }

    await db.$transaction([
      db.lampiran.deleteMany({ where: { pengumumanId: id } }),
      db.pengumuman.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Berhasil dihapus." });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}