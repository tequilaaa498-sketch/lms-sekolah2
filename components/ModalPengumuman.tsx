"use client";

import { useState } from "react";
import Modal from "./ui/Modal";
import { Textarea, Input, Select } from "./ui/Input";
import Button from "./ui/Button";

interface LampiranInput {
  tipe: "FILE" | "LINK" | "VIDEO";
  url: string;
  judul?: string;
}

interface ModalPengumumanProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kelasId: string;
}

export default function ModalPengumuman({ open, onClose, onSuccess, kelasId }: ModalPengumumanProps) {
  const [isi, setIsi] = useState("");
  const [lampiranList, setLampiranList] = useState<LampiranInput[]>([]);
  const [lampiranTipe, setLampiranTipe] = useState<"LINK" | "VIDEO" | "FILE">("LINK");
  const [lampiranUrl, setLampiranUrl] = useState("");
  const [lampiranJudul, setLampiranJudul] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleAddLampiran() {
    if (!lampiranUrl.trim()) return;
    setLampiranList((prev) => [...prev, { tipe: lampiranTipe, url: lampiranUrl, judul: lampiranJudul || undefined }]);
    setLampiranUrl("");
    setLampiranJudul("");
  }

  function handleRemoveLampiran(index: number) {
    setLampiranList((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setIsi("");
    setLampiranList([]);
    setLampiranUrl("");
    setLampiranJudul("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isi.trim()) {
      setError("Isi pengumuman wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pengumuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelasId, isi, lampiran: lampiranList }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan.");
        setLoading(false);
        return;
      }

      resetForm();
      onSuccess();
      onClose();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Post Pengumuman"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Buat Pengumuman Pada Kelas anda"
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          rows={4}
          required
        />

        {/* daftar lampiran yang udah ditambah */}
        {lampiranList.length > 0 && (
          <div className="space-y-2">
            {lampiranList.map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-black/5 bg-[#F9FAFB] p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#111827]">{l.judul || l.url}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{l.tipe}</p>
                </div>
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

        {/* form tambah lampiran */}
        <div className="rounded-lg border border-dashed border-[#D1D5DB] p-3">
          <p className="mb-2 text-xs font-semibold text-[#374151]">Tambah Lampiran (opsional)</p>
          <div className="grid grid-cols-3 gap-2">
            <Select value={lampiranTipe} onChange={(e) => setLampiranTipe(e.target.value as any)}>
              <option value="LINK">Link</option>
              <option value="VIDEO">Video</option>
              <option value="FILE">File</option>
            </Select>
            <Input
              placeholder="URL"
              value={lampiranUrl}
              onChange={(e) => setLampiranUrl(e.target.value)}
              className="col-span-2"
            />
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

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Posting
          </Button>
        </div>
      </form>
    </Modal>
  );
}