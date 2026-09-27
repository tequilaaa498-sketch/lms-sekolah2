import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeading, PillLinkButton, StatusBadge } from "@/components/ui";
import Link from "next/link";

export default async function AssessmenPage() {
  const session = await getSession();
  const guruId = session!.userId;

  const assessmenList = await prisma.assessmen.findMany({
    where: { guruId },
    include: {
      kelas: true,
      hasil: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeading
        title="Assessmen"
        subtitle="Kuis dan ujian online yang sudah dibuat."
        action={<PillLinkButton href="/guru/assessmen/baru">+ Buat assessmen</PillLinkButton>}
      />

      {assessmenList.length === 0 ? (
        <p className="text-lms-muted">Belum ada assessmen yang dibuat.</p>
      ) : (
        <div className="space-y-4">
          <div className="hidden grid-cols-5 gap-4 px-6 text-lg font-semibold text-lms-label sm:grid">
            <span>Judul</span>
            <span>Tipe</span>
            <span>Kelas</span>
            <span>Sudah dikerjakan</span>
            <span>Penilaian</span>
          </div>
          {assessmenList.map((a) => {
            const sudah = a.hasil.filter((h) => h.sudahKerjakan).length;
            return (
              <Link
                key={a.id}
                href={`/guru/assessmen/${a.id}`}
                className="grid grid-cols-2 gap-3 rounded-2xl border-3 border-lms-primary bg-lms-bg px-6 py-4 transition hover:bg-lms-primary/10 sm:grid-cols-5 sm:items-center"
              >
                <span className="font-semibold text-lms-dark">{a.judul}</span>
                <span className="font-semibold text-lms-dark">
                  {a.tipe === "KUIS" ? "Kuis" : "Ujian"}
                </span>
                <span className="font-semibold text-lms-dark">{a.kelas.nama}</span>
                <span className="font-semibold text-lms-dark">
                  {sudah} / {a.hasil.length}
                </span>
                <span>
                  <StatusBadge>
                    {a.statusPenilaian === "SELESAI_DINILAI"
                      ? "Selesai dinilai"
                      : "Perlu dinilai"}
                  </StatusBadge>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
