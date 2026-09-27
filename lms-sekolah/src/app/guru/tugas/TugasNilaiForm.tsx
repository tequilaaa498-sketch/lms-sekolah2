"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PillButton, StatusBadge } from "@/components/ui";

type Row = {
  id: string;
  siswaNama: string;
  status: "BELUM_KUMPUL" | "SUDAH_KUMPUL";
  formatKumpul: string | null;
  waktuKumpul: string | null; // sudah diformat di server
  nilai: number | null;
};

export function TugasNilaiForm({ tugasId, initialRows }: { tugasId: string; initialRows: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateNilai(id: string, nilai: number | null) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, nilai } : r)));
    setSaved(false);
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    const res = await fetch(`/api/guru/tugas/${tugasId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pengumpulan: rows.map((r) => ({ id: r.id, nilai: r.nilai })),
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="hidden grid-cols-4 gap-4 px-6 text-lg font-semibold text-lms-label sm:grid">
        <span>Siswa</span>
        <span>Format kumpul</span>
        <span>Waktu kumpul</span>
        <span>Nilai</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-2 items-center gap-3 rounded-2xl border-3 border-lms-primary bg-lms-bg px-6 py-4 sm:grid-cols-4"
        >
          <span className="font-semibold text-lms-dark">{r.siswaNama}</span>
          <span className="font-semibold text-lms-dark">
            {r.status === "BELUM_KUMPUL" ? "Belum kumpul" : r.formatKumpul ?? "—"}
          </span>
          <span className="font-semibold text-lms-dark">{r.waktuKumpul ?? "—"}</span>
          {r.status === "SUDAH_KUMPUL" ? (
            <input
              type="number"
              min={0}
              max={100}
              value={r.nilai ?? ""}
              onChange={(e) =>
                updateNilai(r.id, e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder="Belum dinilai"
              className="w-28 rounded-full border-2 border-lms-primary bg-white px-4 py-1.5 text-center text-sm text-lms-dark outline-none placeholder:text-xs"
            />
          ) : (
            <StatusBadge>—</StatusBadge>
          )}
        </div>
      ))}

      <div className="flex items-center gap-4 pt-2">
        <PillButton type="button" onClick={handleSave} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan nilai"}
        </PillButton>
        {saved && <span className="text-sm text-lms-primary">Tersimpan.</span>}
      </div>
    </div>
  );
}
