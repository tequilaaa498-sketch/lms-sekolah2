import { prisma } from "@/lib/prisma";

/** Semua kelas yang diampu seorang guru (unik), beserta mapel yang diajarkan di kelas itu. */
export async function getKelasDiampu(guruId: string) {
  const rows = await prisma.guruMataPelajaran.findMany({
    where: { guruId },
    include: { kelas: true, mataPelajaran: true },
    orderBy: { kelas: { nama: "asc" } },
  });

  const kelasMap = new Map<string, { id: string; nama: string; mapel: { id: string; nama: string }[] }>();
  for (const row of rows) {
    const existing = kelasMap.get(row.kelas.id);
    if (existing) {
      existing.mapel.push(row.mataPelajaran);
    } else {
      kelasMap.set(row.kelas.id, {
        id: row.kelas.id,
        nama: row.kelas.nama,
        mapel: [row.mataPelajaran],
      });
    }
  }
  return Array.from(kelasMap.values());
}

/** Daftar mata pelajaran unik yang diampu seorang guru. */
export async function getMapelDiampu(guruId: string) {
  const rows = await prisma.guruMataPelajaran.findMany({
    where: { guruId },
    include: { mataPelajaran: true },
    distinct: ["mataPelajaranId"],
    orderBy: { mataPelajaran: { nama: "asc" } },
  });
  return rows.map((r) => r.mataPelajaran);
}

export async function getTotalSiswaDiampu(guruId: string) {
  const kelasList = await getKelasDiampu(guruId);
  if (kelasList.length === 0) return 0;
  return prisma.siswa.count({
    where: { kelasId: { in: kelasList.map((k) => k.id) } },
  });
}
