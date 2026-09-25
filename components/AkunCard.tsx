"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "./ui/Badge";

export interface AkunData {
  id: string;
  nama: string;
  email: string;
  nis?: string | null;
  nik?: string | null;
  fotoProfil?: string | null;
  deskripsi?: string | null;
  role: "SISWA" | "GURU";
  kelasReferensi?: { label: string } | null; // buat siswa -- status rombel (12 PPLG 2, dst), langsung di User
  kelasGuruMapel?: { kelas: { judul: string }; mapel: { nama: string } }[]; // buat guru
}

interface AkunCardProps {
  data: AkunData;
  isEditable?: boolean;
  onEdit?: (akun: AkunData) => void;
  onDelete?: (id: string) => void;
}

export default function AkunCard({ data, isEditable = false, onEdit, onDelete }: AkunCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const subInfo =
    data.role === "SISWA"
      ? data.kelasReferensi?.label ?? "Belum ada kelas"
      : data.kelasGuruMapel && data.kelasGuruMapel.length > 0
      ? `${data.kelasGuruMapel[0].mapel.nama} • ${data.kelasGuruMapel.length} kelas`
      : "Belum ada kelas";

  return (
    <article
      onClick={() => router.push(`/profil/${data.id}`)}
      className="group relative flex cursor-pointer items-start gap-3 overflow-hidden border border-gray-300 bg-white p-4 text-gray-900 transition-colors hover:border-gray-500"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-bold text-gray-600">
        {data.fotoProfil ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.fotoProfil} alt={data.nama} className="h-full w-full object-cover" />
        ) : (
          data.nama.charAt(0)
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold">{data.nama}</p>
          <Badge tone="gray" className="!bg-white/20 !text-white">
            {data.role === "SISWA" ? "Siswa" : "Guru"}
          </Badge>
        </div>
        <p className="truncate text-xs text-gray-600">{data.email}</p>
        <p className="mt-0.5 text-[11px] text-gray-600">
          {data.role === "SISWA" ? "NIS" : "NIK"}: {data.role === "SISWA" ? data.nis : data.nik}
        </p>
        <p className="mt-1 truncate text-[11px] font-medium text-gray-700">{subInfo}</p>
        {data.deskripsi && <p className="mt-1 line-clamp-2 text-[11px] italic text-gray-600">&quot;{data.deskripsi}&quot;</p>}
      </div>

      {isEditable && (
        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-28 overflow-hidden rounded-lg border border-black/5 bg-white shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(data);
                }}
                className="block w-full cursor-pointer px-3 py-2 text-left text-xs font-medium text-[#374151] hover:bg-black/5"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete?.(data.id);
                }}
                className="block w-full cursor-pointer px-3 py-2 text-left text-xs font-medium text-gray-900 hover:bg-gray-100"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}