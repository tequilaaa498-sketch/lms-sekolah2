"use client";

import { useEffect, useState } from "react";
import Modal from "./ui/Modal";
import { Input, Select, Textarea } from "./ui/Input";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

type Tipe = "KUIS" | "UJIAN";
type Sumber = "BARU" | "EXISTING";

interface KelasOption {
  id: string;
  label: string;
}
interface MapelOption {
  id: string;
  nama: string;
}
interface AsesmenExisting {
  id: string;
  judul: string;
  tipe: Tipe;
}

interface ModalBuatAsesmenProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (asesmenId: string) => void; // dikasih id -> parent bisa redirect ke halaman tambah soal
  defaultKelasId?: string; // kalau dibuka dari dalam halaman detail kelas, prefill 1 kelas
  fixedTipe?: Tipe; // kalau dibuka dari tombol "Buat Quiz"/"Buat Ujian Online" spesifik, kunci tipenya
}

export default function ModalBuatAsesmen({ open, onClose, onSuccess, defaultKelasId, fixedTipe }: ModalBuatAsesmenProps) {
  const [sumber, setSumber] = useState<Sumber>("BARU");

  // form buat baru
  const [judul, setJudul] = useState("");
  const [tipe, setTipe] = useState<Tipe>(fixedTipe ?? "KUIS");
  const [mapelId, setMapelId] = useState("");
  const [durasiMenit, setDurasiMenit] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  // kirim dari existing
  const [asesmenExistingList, setAsesmenExistingList] = useState<AsesmenExisting[]>([]);
  const [selectedAsesmenId, setSelectedAsesmenId] = useState("");

  const [kelasList, setKelasList] = useState<KelasOption[]>([]);
  const [mapelList, setMapelList] = useState<MapelOption[]>([]);
  const [selectedKelasIds, setSelectedKelasIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    fetch("/api/kelas")
      .then((res) => res.json())
      .then((data) => setKelasList((data.data ?? []).map((k: any) => ({ id: k.id, label: k.judul }))))
      .catch(() => {});

    fetch("/api/mapel")
      .then((res) => res.json())
      .then((data) => setMapelList(data.data ?? []))
      .catch(() => {});

    // ambil daftar asesmen guru sendiri, buat opsi "kirim dari asesmen"
    fetch("/api/asesmen")
      .then((res) => res.json())
      .then((data) => {
        const list = (data.data ?? []).filter((a: any) => !fixedTipe || a.tipe === fixedTipe);
        setAsesmenExistingList(list.map((a: any) => ({ id: a.id, judul: a.judul, tipe: a.tipe })));
      })
      .catch(() => {});

    setSumber("BARU");
    setJudul("");
    setTipe(fixedTipe ?? "KUIS");
    setMapelId("");
    setDurasiMenit("");
    setDeskripsi("");
    setSelectedAsesmenId("");
    setSelectedKelasIds(defaultKelasId ? [defaultKelasId] : []);
    setError("");
  }, [open, defaultKelasId, fixedTipe]);

  function toggleKelas(id: string) {
    setSelectedKelasIds((prev) => (prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (selectedKelasIds.length === 0) {
      setError("Pilih minimal 1 kelas tujuan.");
      return;
    }

    setLoading(true);

    try {
      // ============ KIRIM DARI ASESMEN EXISTING ============
      if (sumber === "EXISTING") {
        if (!selectedAsesmenId) {
          setError("Pilih asesmen yang mau dikirim.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/asesmen/${selectedAsesmenId}/kirim-ke-kelas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kelasIds: selectedKelasIds }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Terjadi kesalahan.");
          setLoading(false);
          return;
        }

        onSuccess(selectedAsesmenId);
        onClose();
        return;
      }

      // ============ BUAT BARU ============
      const res = await fetch("/api/asesmen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          tipe,
          mapelId: mapelId || null,
          durasiMenit: durasiMenit ? Number(durasiMenit) : null,
          deskripsi: deskripsi || null,
          kelasIds: selectedKelasIds,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan.");
        setLoading(false);
        return;
      }

      onSuccess(data.data.id);
      onClose();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={fixedTipe === "KUIS" ? "Buat Quiz" : fixedTipe === "UJIAN" ? "Buat Ujian Online" : "Buat Asesmen"} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* toggle sumber - cuma tampil kalau ada asesmen existing yang bisa dipilih */}
        {asesmenExistingList.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSumber("BARU")}
              className="cursor-pointer rounded-lg border py-2 text-xs font-semibold transition-colors"
              style={
                sumber === "BARU"
                  ? { background: "#111827", borderColor: "#111827", color: "white" }
                  : { borderColor: "#D1D5DB", color: "#374151" }
              }
            >
              Buat Baru
            </button>
            <button
              type="button"
              onClick={() => setSumber("EXISTING")}
              className="cursor-pointer rounded-lg border py-2 text-xs font-semibold transition-colors"
              style={
                sumber === "EXISTING"
                  ? { background: "#111827", borderColor: "#111827", color: "white" }
                  : { borderColor: "#D1D5DB", color: "#374151" }
              }
            >
              Kirim dari Asesmen
            </button>
          </div>
        )}

        {sumber === "EXISTING" ? (
          <Select
            label="Pilih Asesmen"
            placeholder="Pilih asesmen yang sudah dibuat"
            value={selectedAsesmenId}
            onChange={(e) => setSelectedAsesmenId(e.target.value)}
            required
          >
            {asesmenExistingList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.judul}
              </option>
            ))}
          </Select>
        ) : (
          <>
            {!fixedTipe && (
              <div className="grid grid-cols-2 gap-2">
                {(["KUIS", "UJIAN"] as Tipe[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipe(t)}
                    className="cursor-pointer rounded-lg border py-2 text-xs font-semibold transition-colors"
                    style={
                      tipe === t
                        ? { background: "#111827", borderColor: "#111827", color: "white" }
                        : { borderColor: "#D1D5DB", color: "#374151" }
                    }
                  >
                    {t === "KUIS" ? "Kuis" : "Ujian Online"}
                  </button>
                ))}
              </div>
            )}

            <Input label="Judul Asesmen" value={judul} onChange={(e) => setJudul(e.target.value)} required />

            <Select label="Mapel (opsional)" placeholder="Pilih mapel" value={mapelId} onChange={(e) => setMapelId(e.target.value)}>
              {mapelList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama}
                </option>
              ))}
            </Select>

            <Input
              label="Durasi (menit)"
              type="number"
              min={1}
              value={durasiMenit}
              onChange={(e) => setDurasiMenit(e.target.value)}
            />

            <Textarea label="Deskripsi (opsional)" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
          </>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Kirim ke Kelas</label>
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

        {sumber === "BARU" && (
          <p className="rounded-lg bg-[#F9FAFB] p-3 text-xs text-[#6B7280]">
            Setelah dibuat, asesmen berstatus <strong>Proses</strong> — tambahkan soal dulu, baru klik &quot;Selesaikan
            Asesmen&quot; supaya muncul di kelas.
          </p>
        )}

        {error && <p className="text-xs font-medium text-gray-700">{error}</p>}

        <Button type="submit" loading={loading} className="w-full">
          {sumber === "EXISTING" ? "Kirim ke Kelas" : "Lanjut Tambah Soal"}
        </Button>
      </form>
    </Modal>
  );
}