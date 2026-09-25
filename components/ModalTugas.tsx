"use client";

import { useEffect, useState } from "react";
import Modal from "./ui/Modal";
import { Input, Select, Textarea } from "./ui/Input";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { TugasData } from "./TugasCard";

interface KelasOption {
  id: string;
  label: string;
}
interface MapelOption {
  id: string;
  nama: string;
}
interface LampiranInput {
  tipe: "FILE" | "LINK" | "VIDEO";
  url: string;
  judul?: string;
}

interface ModalTugasProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  initialData?: (TugasData & { mapelId?: string | null }) | null;
  defaultKelasId?: string; // kalau dibuka dari dalam halaman detail kelas, prefill 1 kelas
}

export default function ModalTugas({ open, onClose, onSuccess, mode, initialData, defaultKelasId }: ModalTugasProps) {
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [mapelList, setMapelList] = useState<MapelOption[]>([]);

  const [kelasList, setKelasList] = useState<KelasOption[]>([]);
  const [selectedKelasIds, setSelectedKelasIds] = useState<string[]>([]);

  const [lampiranList, setLampiranList] = useState<LampiranInput[]>([]);
  const [lampiranTipe, setLampiranTipe] = useState<"LINK" | "VIDEO" | "FILE">("LINK");
  const [lampiranUrl, setLampiranUrl] = useState("");
  const [lampiranJudul, setLampiranJudul] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    fetch("/api/mapel")
      .then((res) => res.json())
      .then((data) => setMapelList(data.data ?? []))
      .catch(() => {});

    fetch("/api/kelas")
      .then((res) => res.json())
      .then((data) => setKelasList((data.data ?? []).map((k: any) => ({ id: k.id, label: k.judul }))))
      .catch(() => {});

    if (mode === "edit" && initialData) {
      setJudul(initialData.judul);
      setIsi(initialData.isi ?? "");
      setMapelId(initialData.mapelId ?? "");
      setSelectedKelasIds((initialData.kelasTujuan ?? []).map((kt: any) => kt.kelas.id));
      setLampiranList((initialData.lampiran ?? []).map((l) => ({ tipe: l.tipe, url: l.url, judul: l.judul ?? undefined })));
    } else {
      setJudul("");
      setIsi("");
      setMapelId("");
      setSelectedKelasIds(defaultKelasId ? [defaultKelasId] : []);
      setLampiranList([]);
    }
    setError("");
  }, [open, mode, initialData, defaultKelasId]);

  function toggleKelas(id: string) {
    setSelectedKelasIds((prev) => (prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]));
  }

  function handleAddLampiran() {
    if (!lampiranUrl.trim()) return;
    setLampiranList((prev) => [...prev, { tipe: lampiranTipe, url: lampiranUrl, judul: lampiranJudul || undefined }]);
    setLampiranUrl("");
    setLampiranJudul("");
  }

  function handleRemoveLampiran(index: number) {
    setLampiranList((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!judul.trim()) {
      setError("Judul wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const url = mode === "create" ? "/api/tugas" : `/api/tugas/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          isi: isi || null,
          mapelId: mapelId || null,
          kelasIds: selectedKelasIds, // opsional -- boleh kosong, artinya "keep di draft dulu"
          lampiran: lampiranList,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan.");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "create" ? "Buat Tugas" : "Edit Tugas"} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Judul Tugas" value={judul} onChange={(e) => setJudul(e.target.value)} required />
        <Textarea label="Deskripsi/Instruksi (opsional)" value={isi} onChange={(e) => setIsi(e.target.value)} rows={4} />

        <Select label="Mapel (opsional)" placeholder="Pilih mapel" value={mapelId} onChange={(e) => setMapelId(e.target.value)}>
          {mapelList.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nama}
            </option>
          ))}
        </Select>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#374151]">
            Kirim ke Kelas (opsional — bisa disimpan dulu tanpa dikirim, kirim belakangan)
          </label>
          <select
            className="w-full rounded-lg border border-[#D1D5DB] px-3.5 py-2.5 text-sm outline-none focus:border-gray-900"
            value=""
            onChange={(e) => e.target.value && toggleKelas(e.target.value)}
          >
            <option value="">+ Tambah kelas</option>
            {kelasList
              .filter((k) => !selectedKelasIds.includes(k.id))
              .map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
          </select>

          {selectedKelasIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedKelasIds.map((id) => {
                const k = kelasList.find((kk) => kk.id === id);
                return (
                  <Badge key={id} tone="brand" className="flex items-center gap-1">
                    {k?.label}
                    <button type="button" onClick={() => toggleKelas(id)} className="cursor-pointer hover:text-gray-900">
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-[#D1D5DB] p-3">
          <p className="mb-2 text-xs font-semibold text-[#374151]">Lampiran Soal/Instruksi (opsional)</p>

          {lampiranList.length > 0 && (
            <div className="mb-2 space-y-2">
              {lampiranList.map((l, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-black/5 bg-[#F9FAFB] p-2">
                  <span className="truncate text-xs text-[#374151]">{l.judul || l.url}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLampiran(i)}
                    className="cursor-pointer text-xs font-medium text-gray-900 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Select value={lampiranTipe} onChange={(e) => setLampiranTipe(e.target.value as any)}>
              <option value="LINK">Link</option>
              <option value="VIDEO">Video</option>
              <option value="FILE">File</option>
            </Select>
            <Input placeholder="URL" value={lampiranUrl} onChange={(e) => setLampiranUrl(e.target.value)} className="col-span-2" />
          </div>
          <Input
            placeholder="Judul lampiran (opsional)"
            value={lampiranJudul}
            onChange={(e) => setLampiranJudul(e.target.value)}
            className="mt-2"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddLampiran} className="mt-2 w-full">
            + Tambah Lampiran
          </Button>
        </div>

        {error && <p className="text-xs font-medium text-gray-700">{error}</p>}

        <Button type="submit" loading={loading} className="w-full">
          {mode === "create" ? "Buat Tugas" : "Simpan Perubahan"}
        </Button>
      </form>
    </Modal>
  );
}