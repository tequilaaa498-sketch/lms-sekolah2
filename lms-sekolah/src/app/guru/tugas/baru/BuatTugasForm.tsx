"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, SelectField, PillButton } from "@/components/ui";

type Kelas = { id: string; nama: string; mapel: { id: string; nama: string }[] };

export function BuatTugasForm({ kelasDiampu }: { kelasDiampu: Kelas[] }) {
  const router = useRouter();
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kelasId, setKelasId] = useState(kelasDiampu[0]?.id ?? "");
  const kelasAktif = kelasDiampu.find((k) => k.id === kelasId);
  const [mataPelajaranId, setMataPelajaranId] = useState(kelasAktif?.mapel[0]?.id ?? "");
  const [batasKumpul, setBatasKumpul] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/guru/tugas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, deskripsi, kelasId, mataPelajaranId, batasKumpul }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Gagal membuat tugas.");
      return;
    }
    router.push(`/guru/tugas?id=${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <TextField
        label="Judul tugas"
        required
        value={judul}
        onChange={(e) => setJudul(e.target.value)}
        placeholder="Contoh: Esai Teks Argumentasi"
      />

      <label className="block">
        <span className="mb-2 block text-sm text-lms-dark">Deskripsi (opsional)</span>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border-3 border-lms-primary bg-lms-bg px-5 py-4 text-lms-dark outline-none placeholder:text-lms-muted"
          placeholder="Instruksi singkat untuk siswa"
        />
      </label>

      <SelectField
        label="Kelas"
        value={kelasId}
        onChange={(e) => {
          setKelasId(e.target.value);
          const k = kelasDiampu.find((kl) => kl.id === e.target.value);
          setMataPelajaranId(k?.mapel[0]?.id ?? "");
        }}
      >
        {kelasDiampu.map((k) => (
          <option key={k.id} value={k.id}>
            {k.nama}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Mata pelajaran"
        value={mataPelajaranId}
        onChange={(e) => setMataPelajaranId(e.target.value)}
      >
        {kelasAktif?.mapel.map((m) => (
          <option key={m.id} value={m.id}>
            {m.nama}
          </option>
        ))}
      </SelectField>

      <TextField
        label="Batas kumpul"
        type="date"
        required
        value={batasKumpul}
        onChange={(e) => setBatasKumpul(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <PillButton type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan tugas"}
      </PillButton>
    </form>
  );
}
