"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/guru", label: "Ringkasan" },
  { href: "/guru/siswa-kelas", label: "Siswa & kelas" },
  { href: "/guru/assessmen", label: "Assessmen" },
  { href: "/guru/materi", label: "Materi" },
  { href: "/guru/tugas", label: "Tugas" },
  { href: "/guru/nilai", label: "Nilai" },
];

export function GuruNav({ namaLengkap }: { namaLengkap: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-lms-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full border-2 border-white/70" />
          <span className="-ml-4 h-10 w-11 rounded-full border-2 border-white/70" />
          <span className="font-display italic font-semibold text-white text-lg">
            LMS Sekolah
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-white/70 px-5 py-2 text-sm text-white"
          title={`Masuk sebagai ${namaLengkap} — klik untuk keluar`}
        >
          GURU
        </button>
      </div>
      <nav className="bg-lms-primary-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-3">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/guru"
                ? pathname === "/guru"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-5 py-2.5 text-sm transition ${
                  active
                    ? "bg-lms-primary text-white"
                    : "text-lms-dark hover:bg-lms-primary/30"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
