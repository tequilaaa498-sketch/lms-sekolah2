import { getSession } from "@/lib/auth";
import { getKelasDiampu } from "@/lib/guru-data";
import { PageHeading } from "@/components/ui";
import { BuatTugasForm } from "./BuatTugasForm";

export default async function BuatTugasPage() {
  const session = await getSession();
  const kelasDiampu = await getKelasDiampu(session!.userId);

  return (
    <>
      <PageHeading
        title="Buat tugas baru"
        subtitle="Tugas akan otomatis muncul untuk seluruh siswa di kelas terpilih."
      />
      {kelasDiampu.length === 0 ? (
        <p className="text-lms-muted">
          Kamu belum ditugaskan mengampu kelas manapun. Hubungi admin untuk penugasan kelas.
        </p>
      ) : (
        <BuatTugasForm kelasDiampu={kelasDiampu} />
      )}
    </>
  );
}
