"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  GraduationCapIcon,
  TeacherIcon,
  AdminIcon,
  BookIcon,
  KepsekIcon,
} from "@/components/icons";

const ROLES = [
  { value: "SISWA", label: "Siswa", Icon: GraduationCapIcon },
  { value: "GURU", label: "Guru", Icon: TeacherIcon },
  { value: "ADMIN", label: "Admin", Icon: AdminIcon },
  { value: "KURIKULUM", label: "Kurikulum", Icon: BookIcon },
  { value: "KEPSEK", label: "KepSek", Icon: KepsekIcon },
] as const;

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("GURU");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ingatSaya, setIngatSaya] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal masuk. Coba lagi.");
        return;
      }
      router.push(data.redirectPath);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[29px] border-4 border-lms-primary bg-lms-bg px-8 py-10 sm:px-16 sm:py-14">
      {/* Tab pilihan role */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
        {ROLES.map(({ value, label, Icon }) => {
          const active = value === role;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className="flex flex-col items-center gap-2 text-sm"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 ${
                  active
                    ? "border-lms-primary bg-lms-primary/10 text-lms-primary"
                    : "border-transparent text-lms-dark"
                }`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <span className={active ? "text-lms-dark font-medium" : "text-lms-dark/70"}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <h1 className="mt-10 text-center font-display text-4xl sm:text-5xl text-lms-dark">
        Selamat Datang!
      </h1>
      <p className="mt-3 text-center text-lms-muted max-w-sm mx-auto">
        Masuk ke akunmu untuk melanjutkan pembelajaran yang menyenangkan
      </p>

      <form onSubmit={handleSubmit} className="mt-10 max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3 rounded-2xl border-3 border-lms-primary bg-lms-bg px-5 py-4">
          <MailIcon className="h-5 w-5 text-lms-primary shrink-0" />
          <input
            type="text"
            required
            placeholder="Masukkan Email Atau Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-lms-muted text-lms-dark"
          />
        </div>

        <div className="flex items-center gap-3 rounded-2xl border-3 border-lms-primary bg-lms-bg px-5 py-4">
          <LockIcon className="h-5 w-5 text-lms-primary shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Masukan Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-lms-muted text-lms-dark"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-lms-primary shrink-0"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-lms-dark">
            <input
              type="checkbox"
              checked={ingatSaya}
              onChange={(e) => setIngatSaya(e.target.checked)}
              className="h-5 w-5 rounded accent-lms-primary"
            />
            Ingat Saya
          </label>
          <a href="#" className="text-lms-primary">
            Lupa Password?
          </a>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-lms-dark py-4 text-xl text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      {/* Aksen dekoratif lengkung di bagian bawah kartu, meniru bentuk di desain */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[110%] -translate-x-1/2 rounded-[50%] bg-lms-primary/20"
      />
    </div>
  );
}
