import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeading, PillLinkButton } from "@/components/ui";
import { TugasNilaiForm } from "./TugasNilaiForm";

function formatTanggal(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatWaktu(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function TugasPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getSession();
  const guruId = session!.userId;
  const { id } = await searchParams;

  const daftarTugas = await prisma.tugas.findMany({
    where: { guruId },
    orderBy: { createdAt: "desc" },
    select: { id: true, judul: true },
  });

  const tugasAktifId = id ?? daftarTugas[0]?.id;

  const tugas = tugasAktifId
    ? await prisma.tugas.findFirst({
        where: { id: tugasAktifId, guruId },
        include: {
          kelas: true,
          pengumpulan: { include: { siswa: true }, orderBy: { siswa: { namaLengkap: "asc" } } },
        },
      })
    : null;

  return (
    <>
      <PageHeading
        title={tugas ? tugas.judul : "Tugas"}
        subtitle={
          tugas
            ? `${tugas.kelas.nama} — batas kumpul ${formatTanggal(tugas.batasKumpul)}`
            : "Kamu belum membuat tugas apa pun."
        }
        action={<PillLinkButton href="/guru/tugas/baru">+ Buat tugas baru</PillLinkButton>}
      />

      {daftarTugas.length > 1 && (
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="font-semibold text-lms-dark">Pilih tugas:</span>
          {daftarTugas.map((t) => (
            <Link
              key={t.id}
              href={`/guru/tugas?id=${t.id}`}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                tugasAktifId === t.id
                  ? "bg-lms-primary text-white"
                  : "bg-lms-primary/30 text-lms-dark hover:bg-lms-primary/50"
              }`}
            >
              {t.judul}
            </Link>
          ))}
        </div>
      )}

      {!tugas ? (
        <p className="text-lms-muted">Buat tugas pertamamu lewat tombol di atas.</p>
      ) : (
        <TugasNilaiForm
          tugasId={tugas.id}
          initialRows={tugas.pengumpulan.map((p) => ({
            id: p.id,
            siswaNama: p.siswa.namaLengkap,
            status: p.status,
            formatKumpul: p.formatKumpul,
            waktuKumpul: p.waktuKumpul ? formatWaktu(p.waktuKumpul) : null,
            nilai: p.nilai,
          }))}
        />
      )}
    </>
  );
}
