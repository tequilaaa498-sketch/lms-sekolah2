import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

// Landing page pengunjung lengkap belum dibuat (di luar scope Guru saat ini).
// Untuk sekarang halaman ini jadi pintu masuk sederhana ke halaman login.
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-lms-primary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full border-2 border-white/70" />
            <span className="-ml-4 h-10 w-11 rounded-full border-2 border-white/70" />
            <span className="font-display italic font-semibold text-white text-lg">
              LMS Sekolah
            </span>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-lms-primary"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center bg-lms-bg px-6 py-24 text-center">
        <div>
          <h1 className="font-display text-5xl text-lms-dark sm:text-6xl">
            LMS Sekolah
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lms-muted">
            Learn Better. Create Together. Grow Every Day.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-full bg-lms-dark px-8 py-4 text-white"
          >
            Masuk ke akun
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
