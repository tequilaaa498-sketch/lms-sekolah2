"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, SelectField, PillButton } from "@/components/ui";

type Kelas = { id: string; nama: string; mapel: { id: string; nama: string }[] };

export function BuatAssessmenForm({ kelasDiampu }: { kelasDiampu: Kelas[] }) {
  const router = useRouter();
  const [judul, setJudul] = useState("");
  const [tipe, setTipe] = useState<"KUIS" | "UJIAN">("KUIS");
  const [kelasId, setKelasId] = useState(kelasDiampu[0]?.id ?? "");
  const kelasAktif = kelasDiampu.find((k) => k.id === kelasId);
  const [mataPelajaranId, setMataPelajaranId] = useState(
    kelasAktif?.mapel[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/guru/assessmen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, tipe, kelasId, mataPelajaranId }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Gagal membuat assessmen. Coba lagi.");
      return;
    }
    router.push("/guru/assessmen");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <TextField
        label="Judul assessmen"
        required
        value={judul}
        onChange={(e) => setJudul(e.target.value)}
        placeholder="Contoh: Kuis Aljabar Bab 3"
      />

      <SelectField
        label="Tipe"
        value={tipe}
        onChange={(e) => setTipe(e.target.value as "KUIS" | "UJIAN")}
      >
        <option value="KUIS">Kuis</option>
        <option value="UJIAN">Ujian</option>
      </SelectField>

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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <PillButton type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan assessmen"}
      </PillButton>
    </form>
  );
}
