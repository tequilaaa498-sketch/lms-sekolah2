"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PillButton } from "@/components/ui";

type HasilRow = {
  id: string;
  siswaNama: string;
  sudahKerjakan: boolean;
  nilai: number | null;
};

export function GradingForm({
  assessmenId,
  initialRows,
}: {
  assessmenId: string;
  initialRows: HasilRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateRow(id: string, patch: Partial<HasilRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSaved(false);
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    const res = await fetch(`/api/guru/assessmen/${assessmenId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hasil: rows.map((r) => ({
          id: r.id,
          sudahKerjakan: r.sudahKerjakan,
          nilai: r.nilai,
        })),
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
        <span>Sudah mengerjakan</span>
        <span>Nilai</span>
        <span></span>
      </div>
      {rows.map((r) => (
        <div
          key={r.id}
          className="grid grid-cols-1 items-center gap-3 rounded-2xl border-3 border-lms-primary bg-lms-bg px-6 py-4 sm:grid-cols-4"
        >
          <span className="font-semibold text-lms-dark">{r.siswaNama}</span>
          <label className="flex items-center gap-2 text-sm text-lms-dark">
            <input
              type="checkbox"
              checked={r.sudahKerjakan}
              onChange={(e) => updateRow(r.id, { sudahKerjakan: e.target.checked })}
              className="h-5 w-5 rounded accent-lms-primary"
            />
            Sudah kerjakan
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={r.nilai ?? ""}
            onChange={(e) =>
              updateRow(r.id, {
                nilai: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="—"
            className="w-24 rounded-full border-2 border-lms-primary bg-white px-4 py-1.5 text-center text-sm text-lms-dark outline-none"
          />
        </div>
      ))}

      <div className="flex items-center gap-4 pt-2">
        <PillButton type="button" onClick={handleSave} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan penilaian"}
        </PillButton>
        {saved && <span className="text-sm text-lms-primary">Tersimpan.</span>}
      </div>
    </div>
  );
}
