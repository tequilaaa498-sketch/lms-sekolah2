import { getSession } from "@/lib/auth";
import { getKelasDiampu } from "@/lib/guru-data";
import { PageHeading } from "@/components/ui";
import { BuatAssessmenForm } from "./BuatAssessmenForm";

export default async function BuatAssessmenPage() {
  const session = await getSession();
  const kelasDiampu = await getKelasDiampu(session!.userId);

  return (
    <>
      <PageHeading
        title="Buat assessmen"
        subtitle="Kuis atau ujian baru akan otomatis tersedia untuk seluruh siswa di kelas terpilih."
      />
      {kelasDiampu.length === 0 ? (
        <p className="text-lms-muted">
          Kamu belum ditugaskan mengampu kelas manapun. Hubungi admin untuk penugasan kelas.
        </p>
      ) : (
        <BuatAssessmenForm kelasDiampu={kelasDiampu} />
      )}
    </>
  );
}
