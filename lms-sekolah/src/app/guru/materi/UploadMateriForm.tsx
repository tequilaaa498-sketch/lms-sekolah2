"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, SelectField, PillButton } from "@/components/ui";

type Kelas = { id: string; nama: string; mapel: { id: string; nama: string }[] };

export function UploadMateriForm({ kelasDiampu }: { kelasDiampu: Kelas[] }) {
  const router = useRouter();
  const [judul, setJudul] = useState("");
  const [kelasId, setKelasId] = useState(kelasDiampu[0]?.id ?? "");
  const kelasAktif = kelasDiampu.find((k) => k.id === kelasId);
  const [mataPelajaranId, setMataPelajaranId] = useState(kelasAktif?.mapel[0]?.id ?? "");
  const [tipe, setTipe] = useState<"PDF" | "LINK">("PDF");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSukses(false);

    let isi = link;

    try {
      if (tipe === "PDF") {
        if (!file) {
          setError("Pilih file PDF terlebih dahulu.");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/guru/materi/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.message ?? "Gagal mengunggah file.");
          setLoading(false);
          return;
        }
        isi = uploadData.url;
      }

      const res = await fetch("/api/guru/materi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul, kelasId, mataPelajaranId, tipe, isi }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Gagal menyimpan materi.");
        return;
      }
      setSukses(true);
      setJudul("");
      setLink("");
      setFile(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <TextField
        label="Judul materi"
        required
        value={judul}
        onChange={(e) => setJudul(e.target.value)}
        placeholder="Contoh: Bab 3 - Trigonometri"
      />

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

      <div>
        <span className="mb-2 block text-sm text-lms-dark">Tipe materi</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTipe("PDF")}
            className={`rounded-full px-6 py-2 text-sm font-semibold ${
              tipe === "PDF" ? "bg-lms-primary text-white" : "bg-lms-primary/30 text-lms-dark"
            }`}
          >
            PDF
          </button>
          <button
            type="button"
            onClick={() => setTipe("LINK")}
            className={`rounded-full px-6 py-2 text-sm font-semibold ${
              tipe === "LINK" ? "bg-lms-primary text-white" : "bg-lms-primary/30 text-lms-dark"
            }`}
          >
            Link
          </button>
        </div>
      </div>

      {tipe === "PDF" ? (
        <label className="block">
          <span className="mb-2 block text-sm text-lms-dark">Unggah file (PDF)</span>
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-2xl border-3 border-lms-primary bg-lms-bg px-5 py-4 text-lms-dark outline-none file:mr-4 file:rounded-full file:border-0 file:bg-lms-primary file:px-4 file:py-2 file:text-white"
          />
        </label>
      ) : (
        <TextField
          label="Tempel link"
          type="url"
          required
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {sukses && <p className="text-sm text-lms-primary">Materi berhasil disimpan.</p>}

      <PillButton type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan materi"}
      </PillButton>
    </form>
  );
}
