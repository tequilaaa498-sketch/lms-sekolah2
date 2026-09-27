import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getKelasDiampu, getTotalSiswaDiampu } from "@/lib/guru-data";
import { PageHeading, StatCard } from "@/components/ui";

export default async function SiswaKelasPage({
  searchParams,
}: {
  searchParams: Promise<{ kelas?: string }>;
}) {
  const session = await getSession();
  const guruId = session!.userId;
  const { kelas: kelasIdParam } = await searchParams;

  const kelasDiampu = await getKelasDiampu(guruId);
  const totalSiswa = await getTotalSiswaDiampu(guruId);

  const kelasAktif = kelasDiampu.find((k) => k.id === kelasIdParam) ?? kelasDiampu[0];

  const siswaList = kelasAktif
    ? await prisma.siswa.findMany({
        where: { kelasId: kelasAktif.id },
        include: { nilai: true },
        orderBy: { namaLengkap: "asc" },
      })
    : [];

  return (
    <>
      <PageHeading
        title="Siswa & kelas"
        subtitle="Daftar siswa per kelas yang kamu ajar."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-10 max-w-xl">
        <StatCard value={kelasDiampu.length} label="Kelas diampu" />
        <StatCard value={totalSiswa} label="Total siswa" />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="font-semibold text-lms-dark">Kelas:</span>
        {kelasDiampu.map((k) => (
          <Link
            key={k.id}
            href={`/guru/siswa-kelas?kelas=${k.id}`}
            className={`rounded-full px-5 py-2 font-semibold text-sm ${
              kelasAktif?.id === k.id
                ? "bg-lms-primary text-white"
                : "bg-lms-primary/30 text-lms-dark hover:bg-lms-primary/50"
            }`}
          >
            {k.nama}
          </Link>
        ))}
      </div>

      {siswaList.length === 0 ? (
        <p className="text-lms-muted">Belum ada siswa terdaftar di kelas ini.</p>
      ) : (
        <div className="space-y-4">
          <div className="hidden grid-cols-5 gap-4 px-6 text-lg font-semibold text-lms-label sm:grid">
            <span>No</span>
            <span>Nama siswa</span>
            <span>NISN</span>
            <span>Kehadiran</span>
            <span>Rata-rata nilai</span>
          </div>
          {siswaList.map((s, idx) => {
            const rataRataValues = s.nilai
              .map((n) => n.rataRata)
              .filter((v): v is number => v != null);
            const rataRata =
              rataRataValues.length > 0
                ? (
                    rataRataValues.reduce((a, b) => a + b, 0) / rataRataValues.length
                  ).toFixed(1)
                : "—";
            return (
              <div
                key={s.id}
                className="grid grid-cols-2 gap-3 rounded-2xl border-3 border-lms-primary bg-lms-bg px-6 py-4 sm:grid-cols-5 sm:items-center"
              >
                <span className="font-semibold text-lms-dark">{idx + 1}</span>
                <span className="font-semibold text-lms-dark">{s.namaLengkap}</span>
                <span className="font-semibold text-lms-dark">{s.nisn}</span>
                <span className="font-semibold text-lms-dark">
                  {s.kehadiranPersen}%
                </span>
                <span>
                  <span className="inline-flex rounded-full bg-lms-primary-badge px-4 py-1.5 text-xs text-lms-dark">
                    {rataRata}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
