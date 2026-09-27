"use client";

import { useState } from "react";
import { SelectField, PillButton } from "@/components/ui";

type Kelas = { id: string; nama: string; mapel: { id: string; nama: string }[] };
type HasilRow = {
  siswaId: string;
  siswaNama: string;
  kuis: number | null;
  ujian: number | null;
  tugas: number | null;
  rataRata: number | null;
};

function fmt(n: number | null) {
  return n == null ? "—" : n.toFixed(1);
}

export function GenerateNilaiForm({ kelasDiampu }: { kelasDiampu: Kelas[] }) {
  const [kelasId, setKelasId] = useState(kelasDiampu[0]?.id ?? "");
  const kelasAktif = kelasDiampu.find((k) => k.id === kelasId);
  const [mataPelajaranId, setMataPelajaranId] = useState(kelasAktif?.mapel[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<HasilRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/guru/nilai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kelasId, mataPelajaranId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Gagal generate nilai.");
      return;
    }
    setHasil(data.hasil);
  }

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-end gap-4">
        <div className="w-64">
          <SelectField
            label="Kelas"
            value={kelasId}
            onChange={(e) => {
              setKelasId(e.target.value);
              const k = kelasDiampu.find((kl) => kl.id === e.target.value);
              setMataPelajaranId(k?.mapel[0]?.id ?? "");
              setHasil(null);
            }}
          >
            {kelasDiampu.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="w-64">
          <SelectField
            label="Mata pelajaran"
            value={mataPelajaranId}
            onChange={(e) => {
              setMataPelajaranId(e.target.value);
              setHasil(null);
            }}
          >
            {kelasAktif?.mapel.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </SelectField>
        </div>
        <PillButton type="button" onClick={handleGenerate} disabled={loading}>
          {loading ? "Memproses..." : "Generate"}
        </PillButton>
      </div>

      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

      {hasil && (
        <div className="space-y-4">
          <div className="hidden grid-cols-5 gap-4 px-6 text-lg font-semibold text-lms-label sm:grid">
            <span>Siswa</span>
            <span>Kuis</span>
            <span>Ujian</span>
            <span>Tugas</span>
            <span>Rata-rata</span>
          </div>
          {hasil.map((r) => (
            <div
              key={r.siswaId}
              className="grid grid-cols-2 items-center gap-3 rounded-2xl border-3 border-lms-primary bg-lms-bg px-6 py-4 sm:grid-cols-5"
            >
              <span className="font-semibold text-lms-dark">{r.siswaNama}</span>
              <span className="font-semibold text-lms-dark">{fmt(r.kuis)}</span>
              <span className="font-semibold text-lms-dark">{fmt(r.ujian)}</span>
              <span className="font-semibold text-lms-dark">{fmt(r.tugas)}</span>
              <span>
                <span className="inline-flex rounded-full bg-lms-primary-badge px-4 py-1.5 text-xs text-lms-dark">
                  {fmt(r.rataRata)}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
