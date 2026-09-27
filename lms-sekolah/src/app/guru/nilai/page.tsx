import { getSession } from "@/lib/auth";
import { getKelasDiampu } from "@/lib/guru-data";
import { PageHeading } from "@/components/ui";
import { GenerateNilaiForm } from "./GenerateNilaiForm";

export default async function NilaiPage() {
  const session = await getSession();
  const kelasDiampu = await getKelasDiampu(session!.userId);

  return (
    <>
      <PageHeading
        title="Generate nilai"
        subtitle="Rekap nilai bisa difilter per mata pelajaran, per kelas, per jurusan."
      />
      {kelasDiampu.length === 0 ? (
        <p className="text-lms-muted">
          Kamu belum ditugaskan mengampu kelas manapun. Hubungi admin untuk penugasan kelas.
        </p>
      ) : (
        <GenerateNilaiForm kelasDiampu={kelasDiampu} />
      )}
    </>
  );
}
