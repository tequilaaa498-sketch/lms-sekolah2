"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KelasCard, { KelasData } from "@/components/KelasCard";
import ModalKelas from "@/components/ModalKelas";
import AkunCard, { AkunData } from "@/components/AkunCard";
import ModalAkun from "@/components/ModalAkun";
import LaporanCard, { LaporanData } from "@/components/LaporanCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const BRAND = "#111827";

type Tab = "KELAS" | "AKUN" | "SISWA" | "GURU" | "LAPORAN";

function TabIcon({ tab }: { tab: Tab }) {
  const paths: Record<Tab, React.ReactNode> = {
    KELAS: <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />,
    AKUN: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6" />,
    SISWA: <path d="M12 3 2 8l10 5 8-4v6M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" />,
    GURU: <path d="M4 19V5a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M9 8h7 M9 12h7 M9 16h4" />,
    LAPORAN: <path d="M6 2h9l5 5v15H6V2Zm9 0v5h5M9 13h6M9 17h4" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] flex-shrink-0">
      {paths[tab]}
    </svg>
  );
}

const TABS: { key: Tab; label: string }[] = [
  { key: "KELAS", label: "Buat Kelas" },
  { key: "AKUN", label: "Buat Akun" },
  { key: "SISWA", label: "Daftar Siswa" },
  { key: "GURU", label: "Daftar Guru" },
  { key: "LAPORAN", label: "Laporan" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("KELAS");
  const [me, setMe] = useState<{ nama: string; role: string; fotoProfil: string | null } | null>(null);

  const [kelasList, setKelasList] = useState<KelasData[]>([]);
  const [siswaList, setSiswaList] = useState<AkunData[]>([]);
  const [guruList, setGuruList] = useState<AkunData[]>([]);
  const [laporanList, setLaporanList] = useState<LaporanData[]>([]);
  const [loading, setLoading] = useState(false);

  const [expandedRombel, setExpandedRombel] = useState<string | null>(null);

  const [showModalKelas, setShowModalKelas] = useState(false);
  const [editingKelas, setEditingKelas] = useState<KelasData | null>(null);

  const [showModalAkun, setShowModalAkun] = useState(false);
  const [akunMode, setAkunMode] = useState<"create" | "edit">("create");
  const [akunDefaultRole, setAkunDefaultRole] = useState<"SISWA" | "GURU">("SISWA");
  const [editingAkun, setEditingAkun] = useState<any>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setMe(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    if (TABS.some((tab) => tab.key === requestedTab)) setActiveTab(requestedTab as Tab);
  }, []);

  useEffect(() => {
    loadTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function loadTabData(tab: Tab) {
    setLoading(true);
    try {
      if (tab === "KELAS") {
        const res = await fetch("/api/kelas");
        const data = await res.json();
        setKelasList(data.data ?? []);
      } else if (tab === "SISWA") {
        const res = await fetch("/api/akun?role=SISWA");
        const data = await res.json();
        setSiswaList(data.data ?? []);
      } else if (tab === "GURU") {
        const res = await fetch("/api/akun?role=GURU");
        const data = await res.json();
        setGuruList(data.data ?? []);
      } else if (tab === "LAPORAN") {
        const res = await fetch("/api/lupa-password");
        const data = await res.json();
        setLaporanList(data.data ?? []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  function toggleSidebar() {
    setSidebarOpen((v) => !v);
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  function openBuatKelas() {
    setEditingKelas(null);
    setShowModalKelas(true);
  }
  function openEditKelas(kelas: KelasData) {
    setEditingKelas(kelas);
    setShowModalKelas(true);
  }
  async function handleDeleteKelas(id: string) {
    if (!confirm("Hapus kelas ini? Semua data siswa & guru yang terhubung akan ikut terlepas.")) return;
    const res = await fetch(`/api/kelas/${id}`, { method: "DELETE" });
    if (res.ok) loadTabData("KELAS");
  }

  function openBuatAkun(role: "SISWA" | "GURU") {
    setAkunMode("create");
    setAkunDefaultRole(role);
    setEditingAkun(null);
    setShowModalAkun(true);
  }
  function openEditAkun(akun: AkunData) {
    setAkunMode("edit");
    setAkunDefaultRole(akun.role);

    const a = akun as any;
    setEditingAkun({
      id: akun.id,
      role: akun.role,
      email: akun.email,
      nama: akun.nama,
      nis: akun.nis,
      nik: akun.nik,
      deskripsi: akun.deskripsi,
      fotoProfil: akun.fotoProfil,
      tanggalLahir: a.tanggalLahir,
      jenisKelamin: a.jenisKelamin,
      kelasReferensiId: a.kelasReferensi?.id,
      mapelId: a.kelasGuruMapel?.[0]?.mapel?.id,
      kelasIds:
        akun.role === "SISWA"
          ? (a.kelasSiswa ?? []).map((ks: any) => ks.kelas.id)
          : (a.kelasGuruMapel ?? []).map((kg: any) => kg.kelas.id),
      // walasKelasId dihapus -- fitur walas gak ada lagi
    });
    setShowModalAkun(true);
  }
  async function handleDeleteAkun(id: string, tab: "SISWA" | "GURU") {
    if (!confirm("Hapus akun ini?")) return;
    const res = await fetch(`/api/akun/${id}`, { method: "DELETE" });
    if (res.ok) loadTabData(tab);
  }

  const siswaGrouped = siswaList.reduce((acc: Record<string, AkunData[]>, s: any) => {
    const label = s.kelasReferensi?.label ?? "Belum Ada Kelas";
    if (!acc[label]) acc[label] = [];
    acc[label].push(s);
    return acc;
  }, {});

  const guruGrouped = guruList.reduce((acc: Record<string, AkunData[]>, g: any) => {
    const label = g.kelasGuruMapel?.[0]?.mapel?.nama ?? "Belum Ada Mapel";
    if (!acc[label]) acc[label] = [];
    acc[label].push(g);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-black/5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Lorem Ipsum
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {me && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[#111827]">{me.nama}</p>
                <p className="text-xs text-[#9CA3AF]">{me.role}</p>
              </div>
            )}
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#E5E7EB] text-xs font-bold text-[#6B7280]">
              {me?.fotoProfil ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.fotoProfil} alt={me.nama} className="h-full w-full object-cover" />
              ) : (
                me?.nama?.charAt(0) ?? "A"
              )}
            </div>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          />
        )}

        <aside
          aria-label="Navigasi admin"
            className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-gray-300 bg-white p-4 transition-transform duration-300 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="min-h-full bg-white p-4">
            <p className="mb-3 px-2 pt-2 text-sm font-bold text-[#111827]">
              Dashboard Admin
              <br />
              <span style={{ color: BRAND }}>- {TABS.find((t) => t.key === activeTab)?.label}</span>
            </p>
            <nav className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSidebarOpen(false);
                  }}
                  title={tab.label}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors"
                  style={
                    activeTab === tab.key
                      ? { background: `${BRAND}1A`, color: BRAND }
                      : { background: "transparent", color: "#374151" }
                  }
                >
                  <TabIcon tab={tab.key} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {loading && <p className="text-sm text-[#9CA3AF]">Memuat...</p>}

          {!loading && activeTab === "KELAS" && (
            <div>
              <div className="mb-4 flex justify-end">
                <Button onClick={openBuatKelas}>Buat Kelas</Button>
              </div>

              {kelasList.length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">Belum ada kelas dibuat.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {kelasList.map((k) => (
                    <KelasCard
                      key={k.id}
                      data={k}
                      isEditable
                      basePath="/admin/kelas"
                      onEdit={openEditKelas}
                      onDelete={handleDeleteKelas}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "AKUN" && (
            <div className="mx-auto max-w-md border border-gray-300 bg-white p-6 text-center">
              <p className="text-sm font-bold text-[#111827]">Registrasi Akun Baru</p>
              <p className="mt-1 text-xs text-[#6B7280]">Pilih jenis akun yang ingin didaftarkan.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button onClick={() => openBuatAkun("GURU")}>Buat Akun Guru</Button>
                <Button variant="outline" onClick={() => openBuatAkun("SISWA")}>
                  Buat Akun Siswa
                </Button>
              </div>
            </div>
          )}

          {!loading && activeTab === "SISWA" && (
            <div className="space-y-3">
              {Object.keys(siswaGrouped).length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">Belum ada siswa terdaftar.</p>
              ) : (
                Object.entries(siswaGrouped).map(([label, list]) => {
                  const isOpen = expandedRombel === label;
                  return (
                    <section key={label} className="overflow-hidden border border-gray-300 bg-white">
                      <button
                        onClick={() => setExpandedRombel(isOpen ? null : label)}
                        className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#111827]">{label}</p>
                          <Badge tone="brand">{list.length} Siswa</Badge>
                        </div>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9CA3AF"
                          strokeWidth="2"
                          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="space-y-2 border-t border-black/5 p-4">
                          {list.map((s) => (
                            <AkunCard
                              key={s.id}
                              data={s}
                              isEditable
                              onEdit={openEditAkun}
                              onDelete={(id) => handleDeleteAkun(id, "SISWA")}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })
              )}
            </div>
          )}

          {!loading && activeTab === "GURU" && (
            <div>
              {Object.keys(guruGrouped).length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">Belum ada guru terdaftar.</p>
              ) : (
                Object.entries(guruGrouped).map(([mapel, list]) => (
                  <div key={mapel} className="mb-6">
                    <p className="mb-3 text-sm font-bold text-[#111827]">{mapel}</p>
                    <div className="space-y-3">
                      {list.map((g) => (
                        <AkunCard
                          key={g.id}
                          data={g}
                          isEditable
                          onEdit={openEditAkun}
                          onDelete={(id) => handleDeleteAkun(id, "GURU")}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && activeTab === "LAPORAN" && (
            <div className="space-y-3">
              {laporanList.length === 0 ? (
                <p className="text-sm text-[#9CA3AF]">Tidak ada laporan lupa password saat ini.</p>
              ) : (
                laporanList.map((l) => <LaporanCard key={l.id} data={l} onUpdated={() => loadTabData("LAPORAN")} />)
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="py-8 text-center text-white" style={{ background: BRAND }}>
        <div className="hidden mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold">Lorem Ipsum</p>
            <p className="mt-2 text-sm">Lorem ipsum dolor sit amet.</p>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/80">
              Platform Learning Management System yang mendukung proses belajar mengajar
              secara modern, efektif, dan terintegrasi.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Social Media</p>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li>Instagram : @chronion999</li>
              <li>Github : Dhanidev-838</li>
              <li>LinkedIn : Dhani Triadi Saputra</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-white/80">
          2026 - Lorem ipsum, All Right Reserved.
        </p>
      </footer>

      <ModalKelas
        open={showModalKelas}
        onClose={() => setShowModalKelas(false)}
        onSuccess={() => loadTabData("KELAS")}
        mode={editingKelas ? "edit" : "create"}
        initialData={editingKelas}
      />

      <ModalAkun
        open={showModalAkun}
        onClose={() => setShowModalAkun(false)}
        onSuccess={() => loadTabData(akunDefaultRole === "SISWA" ? "SISWA" : "GURU")}
        mode={akunMode}
        defaultRole={akunDefaultRole}
        initialData={editingAkun}
      />
    </div>
  );
}