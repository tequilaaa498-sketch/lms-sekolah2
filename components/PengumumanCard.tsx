"use client";

import { useState } from "react";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

interface Lampiran {
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

export interface PengumumanData {
  id: string;
  isi: string;
  createdAt: string;
  author: Author;
  lampiran: Lampiran[];
}

interface PengumumanCardProps {
  data: PengumumanData;
  currentUserId: string;
  onEdit?: (id: string, isiBaru: string) => void;
  onDelete?: (id: string) => void;
}

export default function PengumumanCard({ data, currentUserId, onEdit, onDelete }: PengumumanCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.isi);

  const isOwner = data.author.id === currentUserId;

  function handleSaveEdit() {
    onEdit?.(data.id, editValue);
    setEditing(false);
  }

  return (
    <article className="border border-gray-300 bg-white p-4">
      {/* header author */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] text-xs font-bold text-[#6B7280]">
            {data.author.fotoProfil ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.author.fotoProfil} alt={data.author.nama} className="h-full w-full object-cover" />
            ) : (
              data.author.nama.charAt(0)
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-[#111827]">{data.author.nama}</p>
            <div className="flex items-center gap-1.5">
              <Badge tone="gray">{data.author.role}</Badge>
              <span className="text-[11px] text-[#9CA3AF]">
                {new Date(data.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {isOwner && !editing && (
          <div className="flex gap-1">
            <button
              onClick={() => setEditing(true)}
              className="cursor-pointer text-xs font-medium text-gray-900 hover:underline"
            >
              Edit
            </button>
            <span className="text-[#D1D5DB]">|</span>
            <button
              onClick={() => onDelete?.(data.id)}
              className="cursor-pointer text-xs font-medium text-gray-900 hover:underline"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* isi */}
      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit}>
              Simpan
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm text-[#374151]">{data.isi}</p>
      )}

      {/* lampiran */}
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

      {/* fitur komentar dihapus total -- pengumuman gak bisa dibalas/dikomentari lagi */}
    </article>
  );
}