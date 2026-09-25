"use client";

import { useState } from "react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

interface NilaiRow {
  submissionId: string;
  nama: string;
  nis: string;
  nilaiSementara: number;
  totalSoalTerjawab: number;
}

interface TabelNilaiProps {
  asesmenId: string;
  judulAsesmen: string;
  nilaiList: NilaiRow[];
  onReset?: () => void;
}

export default function TabelNilai({ asesmenId, judulAsesmen, nilaiList, onReset }: TabelNilaiProps) {
  const [downloading, setDownloading] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/asesmen/${asesmenId}/nilai?format=xlsx`);
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nilai-${judulAsesmen.replace(/\s+/g, "-")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh nilai. Coba lagi.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleReset() {
    if (!confirm("Yakin mau hapus/reset semua nilai asesmen ini?")) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/asesmen/${asesmenId}/nilai`, { method: "DELETE" });
      if (res.ok) onReset?.();
    } catch {
      alert("Gagal reset nilai.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <section className="border border-gray-300 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#111827]">Nilai Siswa</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" loading={resetting} onClick={handleReset}>
            Hapus Nilai
          </Button>
          <Button size="sm" loading={downloading} onClick={handleDownload}>
            Generate Excel
          </Button>
        </div>
      </div>

      {nilaiList.length === 0 ? (
        <p className="mt-6 text-center text-xs text-[#9CA3AF]">Belum ada siswa yang mengumpulkan.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs text-[#9CA3AF]">
                <th className="pb-2 font-semibold">Nama</th>
                <th className="pb-2 font-semibold">NIS</th>
                <th className="pb-2 font-semibold">Soal Terjawab</th>
                <th className="pb-2 text-right font-semibold">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {nilaiList.map((row) => (
                <tr key={row.submissionId} className="border-b border-black/5 last:border-0">
                  <td className="py-2.5 font-medium text-[#111827]">{row.nama}</td>
                  <td className="py-2.5 text-xs text-[#6B7280]">{row.nis}</td>
                  <td className="py-2.5 text-xs text-[#6B7280]">{row.totalSoalTerjawab}</td>
                  <td className="py-2.5 text-right">
                    <Badge tone={row.nilaiSementara >= 75 ? "green" : row.nilaiSementara >= 50 ? "amber" : "red"}>
                      {row.nilaiSementara}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}