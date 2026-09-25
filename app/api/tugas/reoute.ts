import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireRole, ADMIN_TIER } from "@/lib/rbac";

// GET /api/tugas?kelasId=xxx (opsional, khusus guru: filter "Telusuri Berdasarkan Kelas")
// - GURU: daftar tugas miliknya sendiri (dipisah Hari Ini / History di frontend berdasarkan createdAt)
// - SISWA: daftar tugas yang dikirim ke kelas manapun yang dia ikuti, sekalian status submission-nya
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    requireRole(session, ["GURU", "SISWA", ...ADMIN_TIER]);

    if (session!.role === "GURU") {
      const kelasId = req.nextUrl.searchParams.get("kelasId");

      const tugasList = await db.tugas.findMany({
        where: {
          guruId: session!.userId,
          kelasTujuan: kelasId ? { some: { kelasId } } : undefined,
        },
        include: {
          mapel: true,
          lampiran: true,
          kelasTujuan: { include: { kelas: { select: { id: true, judul: true } } } },
          _count: { select: { submission: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ data: tugasList });
    }

    if (session!.role === "SISWA") {
      const kelasSiswaList = await db.kelasSiswa.findMany({
        where: { siswaId: session!.userId },
        select: { kelasId: true },
      });
      const kelasIds = kelasSiswaList.map((k) => k.kelasId);

      if (kelasIds.length === 0) {
        return NextResponse.json({ data: [] });
      }

      const tugasKelasList = await db.tugasKelas.findMany({
        where: { kelasId: { in: kelasIds } },
        include: {
          kelas: { select: { id: true, judul: true } },
          tugas: {
            include: {
              mapel: true,
              guru: { select: { id: true, nama: true, fotoProfil: true } },
              lampiran: true,
              submission: { where: { siswaId: session!.userId } },
            },
          },
        },
        orderBy: { tugas: { createdAt: "desc" } },
      });

      // satu tugas bisa dikirim ke lebih dari 1 kelas yang diikuti siswa -- dedupe, gabung kelasTujuan
      const map = new Map<string, any>();
      for (const tk of tugasKelasList) {
        if (!map.has(tk.tugas.id)) {
          const { submission, ...tugasRest } = tk.tugas;
          map.set(tk.tugas.id, {
            ...tugasRest,
            kelasTujuan: [{ kelas: tk.kelas }],
            statusSubmission: submission[0]?.status ?? "BELUM",
          });
        } else {
          map.get(tk.tugas.id).kelasTujuan.push({ kelas: tk.kelas });
        }
      }

      return NextResponse.json({ data: Array.from(map.values()) });
    }

    // ADMIN_TIER gak punya kebutuhan liat tab Tugas per spec, balikin kosong
    return NextResponse.json({ data: [] });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}

// POST /api/tugas -> buat tugas baru. kelasIds OPSIONAL -- bisa disimpen dulu tanpa dikirim
// body: { judul, isi?, mapelId?, kelasIds?: string[], lampiran?: [{tipe: FILE|LINK|VIDEO, url, judul?, thumbnail?}] }
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    requireRole(session, ["GURU"]);

    const body = await req.json();
    const { judul, isi, mapelId, kelasIds, lampiran } = body;

    if (!judul) {
      return NextResponse.json({ error: "Judul wajib diisi." }, { status: 400 });
    }

    const tugasBaru = await db.$transaction(async (tx) => {
      const tugas = await tx.tugas.create({
        data: {
          guruId: session!.userId,
          judul,
          isi: isi || null,
          mapelId: mapelId || null,
          lampiran:
            Array.isArray(lampiran) && lampiran.length > 0
              ? {
                  create: lampiran.map((l: { tipe: string; url: string; judul?: string; thumbnail?: string }) => ({
                    tipe: l.tipe,
                    url: l.url,
                    judul: l.judul || null,
                    thumbnail: l.thumbnail || null,
                  })),
                }
              : undefined,
        },
      });

      if (Array.isArray(kelasIds) && kelasIds.length > 0) {
        await tx.tugasKelas.createMany({
          data: kelasIds.map((kelasId: string) => ({ tugasId: tugas.id, kelasId })),
        });
      }

      return tugas;
    });

    return NextResponse.json({ message: "Tugas berhasil dibuat.", data: tugasBaru }, { status: 201 });
  } catch (err: any) {
    const status = err.name === "UnauthorizedError" ? 401 : err.name === "ForbiddenError" ? 403 : 500;
    return NextResponse.json({ error: err.message ?? "Terjadi kesalahan." }, { status });
  }
}