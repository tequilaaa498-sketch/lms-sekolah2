import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
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
            href="/"
            className="rounded-full border border-white/70 px-4 py-2 text-xs text-white"
          >
            ← Kembali ke beranda
          </Link>
        </div>
        <div className="h-6 bg-white/10" />
      </header>

      <main className="flex-1 bg-lms-bg py-16">
        <div className="mx-auto max-w-4xl px-6">
          <LoginForm />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
