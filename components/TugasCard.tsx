"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

interface LampiranTugas {
  id: string;
  tipe: "FILE" | "LINK" | "VIDEO";
  url: string;
  judul: string | null;
  thumbnail: string | null;
}
interface Author {
  id: string;
  nama: string;
  fotoProfil: string | null;
  role: string;
}

export interface TugasData {
  id: string;
  judul: string;
  isi: string | null;
  createdAt: string;
  guru: Author;
  mapelId?: string | null;
  mapel?: { nama: string } | null;
  lampiran: LampiranTugas[];
  kelasTujuan?: { kelas: { id: string; judul: string } }[];
  statusSubmission?: "BELUM" | "SUDAH"; // khusus response buat siswa
  _count?: { submission: number };
}

interface SubmissionLampiran {
  id: string;
  tipe: "FILE" | "LINK";
  url: string;
  judul: string | null;
}
interface SubmissionData {
  id: string;
  siswa: { id: string; nama: string; fotoProfil: string | null };
  lampiran: SubmissionLampiran[];
}

interface TugasCardProps {
  data: TugasData;
  currentUserId: string;
  role: "GURU" | "SISWA" | "ADMIN" | "KEPSEK" | "KURIKULUM";
  onEdit?: (tugas: TugasData) => void;
  onDelete?: (id: string) => void;
}

export default function TugasCard({ data, currentUserId, role, onEdit, onDelete }: TugasCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionData[] | null>(null);

  const [uploading, setUploading] = useState(false);
  const [pendingLampiran, setPendingLampiran] = useState<{ tipe: "FILE" | "LINK"; url: string; judul?: string }[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOwner = role === "GURU" && data.guru.id === currentUserId;
  const myStatus = data.statusSubmission ?? "BELUM";

  async function fetchDetail() {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/tugas/${data.id}`);
      const json = await res.json();
      setSubmissions(json.data?.submission ?? []);
    } catch {}
    setLoadingDetail(false);
  }

  async function handleToggleExpand() {
    if (!expanded) await fetchDetail();
    setExpanded((v) => !v);
  }

  async function handleUploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload?kategori=tugas", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) setPendingLampiran((prev) => [...prev, { tipe: "FILE", url: json.url, judul: file.name }]);
    } finally {
      setUploading(false);
    }
  }

  function handleAddLink() {
    if (!linkInput.trim()) return;
    setPendingLampiran((prev) => [...prev, { tipe: "LINK", url: linkInput.trim() }]);
    setLinkInput("");
  }

  function handleRemovePending(i: number) {
    setPendingLampiran((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmitJawaban() {
    if (pendingLampiran.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tugas/${data.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lampiran: pendingLampiran }),
      });
      if (res.ok) {
        setPendingLampiran([]);
        await fetchDetail();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="border border-gray-300 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] text-xs font-bold text-[#6B7280]">
            {data.guru.fotoProfil ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.guru.fotoProfil} alt={data.guru.nama} className="h-full w-full object-cover" />
            ) : (
              data.guru.nama.charAt(0)
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-[#111827]">{data.guru.nama}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="brand">Tugas</Badge>
              {data.mapel && <Badge tone="gray">{data.mapel.nama}</Badge>}
              <span className="text-[11px] text-[#9CA3AF]">
                {new Date(data.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              </span>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex flex-shrink-0 gap-1">
              <button onClick={() => onEdit?.(data)} className="cursor-pointer text-xs font-medium text-gray-900 hover:underline">
              Edit
            </button>
            <span className="text-[#D1D5DB]">|</span>
            <button onClick={() => onDelete?.(data.id)} className="cursor-pointer text-xs font-medium text-gray-900 hover:underline">
              Hapus
            </button>
          </div>
        )}
        {role === "SISWA" && (
          <Badge tone={myStatus === "SUDAH" ? "green" : "red"}>
            {myStatus === "SUDAH" ? "Sudah Dikerjakan" : "Belum Dikerjakan"}
          </Badge>
        )}
      </div>

      <p className="mt-3 text-sm font-bold text-[#111827]">{data.judul}</p>
      {data.isi && <p className="mt-1 whitespace-pre-wrap text-sm text-[#374151]">{data.isi}</p>}

      {data.lampiran.length > 0 && (
        <div className="mt-3 space-y-2">
          {data.lampiran.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-black/5 bg-[#F9FAFB] p-2.5 text-xs font-medium text-[#374151] hover:bg-black/5"
            >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="1.8" className="h-4 w-4 flex-shrink-0">
                {l.tipe === "LINK" ? (
                  <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                ) : (
                  <path d="M4 4h16v16H4z M8 8h8M8 12h8M8 16h5" />
                )}
              </svg>
              <span className="truncate">{l.judul || l.url}</span>
            </a>
          ))}
        </div>
      )}

      <button onClick={handleToggleExpand} className="mt-3 cursor-pointer text-xs font-medium text-[#6B7280] hover:text-gray-900">
        {data._count?.submission ?? submissions?.length ?? 0} kumpulan jawaban {expanded ? "▲" : "▼"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-black/5 pt-3">
          {loadingDetail && <p className="text-xs text-[#9CA3AF]">Memuat...</p>}

          {/* upload jawaban -- cuma siswa, cuma lampiran (file/link), gak ada input teks */}
          {role === "SISWA" && (
            <div className="rounded-lg border border-dashed border-[#D1D5DB] p-3">
              <p className="mb-2 text-xs font-semibold text-[#374151]">Jawab Tugas (lampirkan file/pdf/link)</p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-lg border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-black/5">
                  {uploading ? "Upload..." : "+ Upload File"}
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])}
                  />
                </label>
                <input
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="atau tempel link..."
                      className="min-w-[140px] flex-1 rounded-lg border border-[#D1D5DB] px-3 py-1.5 text-xs outline-none focus:border-gray-900"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddLink}>
                  + Link
                </Button>
              </div>

              {pendingLampiran.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pendingLampiran.map((f, i) => (
                    <Badge key={i} tone="brand" className="flex items-center gap-1">
                      {f.judul || f.url}
                      <button type="button" onClick={() => handleRemovePending(i)} className="cursor-pointer hover:text-gray-900">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                type="button"
                size="sm"
                className="mt-2"
                loading={submitting}
                disabled={pendingLampiran.length === 0}
                onClick={handleSubmitJawaban}
              >
                Kumpulkan Tugas
              </Button>
            </div>
          )}

          {/* daftar semua jawaban -- visible ke sekelas, beda dari Asesmen yang private */}
          {submissions?.map((s) => (
            <div key={s.id} className="flex items-start gap-2">
              <button
                onClick={() => router.push(`/profil/${s.siswa.id}`)}
                className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] text-[10px] font-bold text-[#6B7280]"
              >
                {s.siswa.fotoProfil ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.siswa.fotoProfil} alt={s.siswa.nama} className="h-full w-full object-cover" />
                ) : (
                  s.siswa.nama.charAt(0)
                )}
              </button>
              <div className="flex-1 rounded-lg bg-[#F9FAFB] p-2.5">
                <button
                  onClick={() => router.push(`/profil/${s.siswa.id}`)}
                  className="cursor-pointer text-xs font-bold text-[#111827] hover:underline"
                >
                  {s.siswa.id === currentUserId ? "Anda" : s.siswa.nama}
                </button>
                <div className="mt-1 space-y-1">
                  {s.lampiran.map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs text-gray-900 hover:underline"
                    >
                      {l.judul || l.url}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {!loadingDetail && submissions?.length === 0 && (
            <p className="text-xs text-[#9CA3AF]">Belum ada yang mengumpulkan.</p>
          )}
        </div>
      )}
    </article>
  );
}