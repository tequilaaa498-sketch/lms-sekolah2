"use client";

import { useRouter } from "next/navigation";
import Badge from "./ui/Badge";

export interface AsesmenData {
  id: string;
  judul: string;
  tipe: "KUIS" | "UJIAN";
  status: "PROSES" | "SELESAI";
  durasiMenit: number | null;
  mapel?: { nama: string } | null;
  kelasTujuan?: { kelas: { judul: string } }[];
  _count?: { soal: number; submission: number };
  updatedAt: string;
}

interface AsesmenCardProps {
  data: AsesmenData;
  basePath?: string; // "/guru/asesmen" atau "/siswa/asesmen"
  submissionStatus?: "BELUM" | "SUDAH"; // khusus tampilan siswa
}

const tipeConfig: Record<AsesmenData["tipe"], { label: string; color: string; bg: string }> = {
  KUIS: { label: "Kuis", color: "#3B82F6", bg: "#DBEAFE" },
  UJIAN: { label: "Ujian Online", color: "#8B5CF6", bg: "#EDE9FE" },
};

export default function AsesmenCard({ data, basePath = "/guru/asesmen", submissionStatus }: AsesmenCardProps) {
  const router = useRouter();
  const tc = tipeConfig[data.tipe];

  return (
    <div
      onClick={() => router.push(`${basePath}/${data.id}`)}
      className="group cursor-pointer overflow-hidden border border-gray-300 bg-white transition-colors hover:border-gray-500"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: tc.bg }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={tc.color} strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 2l3 6 6.5.9-4.7 4.6L18 20l-6-3.4L6 20l1.2-6.5L2.5 8.9 9 8l3-6Z" />
            </svg>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge tone={data.status === "SELESAI" ? "green" : "amber"}>
              {data.status === "SELESAI" ? "Selesai" : "Proses"}
            </Badge>
            {submissionStatus && (
              <Badge tone={submissionStatus === "SUDAH" ? "green" : "red"}>
                {submissionStatus === "SUDAH" ? "Sudah dikerjakan" : "Belum dikerjakan"}
              </Badge>
            )}
          </div>
        </div>

        <p className="mt-3 truncate text-sm font-bold text-[#111827]">{data.judul}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone="gray">{tc.label}</Badge>
          {data.mapel && <Badge tone="brand">{data.mapel.nama}</Badge>}
          {data.durasiMenit && <span className="text-[11px] text-[#9CA3AF]">{data.durasiMenit} menit</span>}
        </div>

        {data.kelasTujuan && data.kelasTujuan.length > 0 && (
          <p className="mt-2 truncate text-[11px] text-[#6B7280]">
            {data.kelasTujuan.map((kt) => kt.kelas.judul).join(", ")}
          </p>
        )}

        {data._count && (
          <div className="mt-3 flex items-center gap-3 border-t border-black/5 pt-2.5 text-[11px] text-[#9CA3AF]">
            <span>{data._count.soal} soal</span>
            <span>•</span>
            <span>{data._count.submission} pengumpulan</span>
          </div>
        )}
      </div>
    </div>
  );
}