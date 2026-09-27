import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeading, ActionCard, StatusBadge } from "@/components/ui";

export default async function DashboardGuruPage() {
  const session = await getSession();
  const guruId = session!.userId;

  const tugasTerbaru = await prisma.tugas.findMany({
    where: { guruId },
    include: {
      kelas: true,
      pengumpulan: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalSiswaPerKelas = await prisma.siswa.groupBy({
    by: ["kelasId"],
    _count: { _all: true },
    where: {
      kelasId: { in: tugasTerbaru.map((t) => t.kelasId) },
    },
  });
  const totalSiswaMap = new Map(
    totalSiswaPerKelas.map((row) => [row.kelasId, row._count._all])
  );

  return (
    <>
      <PageHeading
        title="Dashboard guru"
        subtitle="Kelola materi, tugas, dan penilaian untuk kelas kamu."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          href="/guru/siswa-kelas"
          badge="SK"
          title="Siswa & kelas"
          description="Lihat daftar siswa per kelas yang kamu ajar."
        />
        <ActionCard
          href="/guru/materi"
          badge="MT"
          title="Upload materi"
          description="Bagikan materi dalam bentuk PDF atau tautan."
        />
        <ActionCard
          href="/guru/assessmen"
          badge="AS"
          title="Assessmen"
          description="Bikin kuis atau ujian online, lalu beri penilaian."
        />
        <ActionCard
          href="/guru/tugas"
          badge="TG"
          title="Tugas"
          description="Buat tugas baru dan lihat hasil kumpulan siswa."
        />
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl text-lms-dark mb-6">Tugas terbaru</h2>

        {tugasTerbaru.length === 0 ? (
          <p className="text-lms-muted">Belum ada tugas yang dibuat.</p>
        ) : (
          <div className="space-y-4">
            <div className="hidden grid-cols-4 gap-4 px-6 text-lg font-semibold text-lms-label sm:grid">
              <span>Judul tugas</span>
              <span>Kelas</span>
              <span>Terkumpul</span>
              <span>Status</span>
            </div>
            {tugasTerbaru.map((t) => {
              const totalSiswa = totalSiswaMap.get(t.kelasId) ?? 0;
              const sudahKumpul = t.pengumpulan.filter(
                (p) => p.status === "SUDAH_KUMPUL"
              ).length;
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-2 gap-3 rounded-2xl border-3 border-lms-primary bg-lms-bg px-6 py-4 sm:grid-cols-4 sm:items-center"
                >
                  <span className="font-semibold text-lms-dark">{t.judul}</span>
                  <span className="font-semibold text-lms-dark">{t.kelas.nama}</span>
                  <span className="font-semibold text-lms-dark">
                    {sudahKumpul} / {totalSiswa}
                  </span>
                  <span>
                    <StatusBadge>
                      {t.status === "BERJALAN" ? "Berjalan" : "Selesai"}
                    </StatusBadge>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
