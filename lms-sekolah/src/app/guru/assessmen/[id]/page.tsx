import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/ui";
import { GradingForm } from "./GradingForm";

export default async function AssessmenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  const assessmen = await prisma.assessmen.findFirst({
    where: { id, guruId: session!.userId },
    include: {
      kelas: true,
      mataPelajaran: true,
      hasil: { include: { siswa: true }, orderBy: { siswa: { namaLengkap: "asc" } } },
    },
  });

  if (!assessmen) notFound();

  return (
    <>
      <PageHeading
        title={assessmen.judul}
        subtitle={`${assessmen.kelas.nama} — ${assessmen.mataPelajaran.nama} — ${
          assessmen.tipe === "KUIS" ? "Kuis" : "Ujian"
        }`}
      />
      <GradingForm
        assessmenId={assessmen.id}
        initialRows={assessmen.hasil.map((h) => ({
          id: h.id,
          siswaNama: h.siswa.namaLengkap,
          sudahKerjakan: h.sudahKerjakan,
          nilai: h.nilai,
        }))}
      />
    </>
  );
}
