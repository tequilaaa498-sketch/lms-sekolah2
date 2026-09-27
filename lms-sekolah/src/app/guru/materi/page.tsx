import { getSession } from "@/lib/auth";
import { getKelasDiampu } from "@/lib/guru-data";
import { PageHeading } from "@/components/ui";
import { UploadMateriForm } from "./UploadMateriForm";

export default async function MateriPage() {
  const session = await getSession();
  const kelasDiampu = await getKelasDiampu(session!.userId);

  return (
    <>
      <PageHeading
        title="Upload materi"
        subtitle="Materi bisa berupa file PDF atau tautan (link)."
      />
      {kelasDiampu.length === 0 ? (
        <p className="text-lms-muted">
          Kamu belum ditugaskan mengampu kelas manapun. Hubungi admin untuk penugasan kelas.
        </p>
      ) : (
        <UploadMateriForm kelasDiampu={kelasDiampu} />
      )}
    </>
  );
}
