# LMS Sekolah — Modul Guru

Aplikasi LMS Sekolah dibangun dengan **Next.js 16 (App Router) + TypeScript + Tailwind CSS**
untuk frontend & backend (via Next.js API routes / Route Handlers), dan **Prisma ORM**
untuk koneksi ke **MySQL yang dijalankan lewat Laragon**.

Tahap ini fokus ke **role Guru** secara penuh: login, dashboard, siswa & kelas, upload
materi, assessmen (kuis/ujian + penilaian), tugas (buat + nilai kumpulan siswa), dan
generate rekap nilai. Halaman login sudah menyiapkan tab untuk role lain (Admin, Siswa,
Kepsek, Kurikulum) tapi fiturnya menyusul di tahap berikutnya.

## 1. Prasyarat

- [Laragon](https://laragon.org/) sudah terpasang & MySQL-nya menyala (Start All di Laragon).
- Node.js 20+ (cek dengan `node -v`).

## 2. Buat database di Laragon

1. Buka Laragon, klik kanan tray icon, pilih MySQL, lalu HeidiSQL (atau phpMyAdmin bila aktif).
2. Buat database baru bernama `lms_sekolah` (collation `utf8mb4_general_ci` sudah cukup).

## 3. Konfigurasi environment

File `.env` sudah disiapkan:

```
DATABASE_URL="mysql://root:@localhost:3306/lms_sekolah"
JWT_SECRET="ganti-dengan-secret-acak-yang-panjang-dan-rahasia"
```

Sesuaikan user/password kalau konfigurasi MySQL Laragon-mu berbeda dari default
(`root` tanpa password). **Ganti `JWT_SECRET`** dengan string acak yang panjang
sebelum dipakai serius (bisa generate lewat `openssl rand -base64 32`).

## 4. Install dependency & siapkan database

```
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

Catatan: `prisma generate` / `migrate` butuh koneksi internet untuk mengunduh engine
Prisma saat pertama kali dijalankan di komputer baru — proses normal, cukup sekali di awal.

Akun guru contoh setelah seeding:

- Email/Username: `guru@lmssekolah.test` atau `guru.sari`
- Password: `guru123`

## 5. Jalankan aplikasi

```
npm run dev
```

Buka `http://localhost:3000`, klik "Masuk", pilih tab Guru, lalu login dengan akun di atas.

## 6. Struktur proyek penting

```
prisma/schema.prisma        Model database (User, Kelas, Siswa, Materi, Tugas, Assessmen, Nilai, dst.)
prisma/seed.ts               Data contoh
src/middleware.ts            Proteksi route per-role (redirect ke /login jika belum sesuai)
src/lib/auth.ts              Session login berbasis JWT (cookie httpOnly)
src/lib/prisma.ts            Koneksi Prisma Client (singleton)
src/lib/guru-data.ts         Helper query data khusus Guru
src/app/login/               Halaman login multi-role
src/app/guru/                Semua halaman role Guru (dashboard, siswa-kelas, assessmen, materi, tugas, nilai)
src/app/api/auth/            API login & logout
src/app/api/guru/            API untuk fitur-fitur Guru (materi, tugas, assessmen, generate nilai)
```

## 7. Menambah kelas/siswa/mapel baru

Untuk tahap ini, data master (kelas, siswa, mata pelajaran, penugasan guru ke kelas)
masih dikelola lewat `prisma/seed.ts` atau langsung lewat Prisma Studio:

```
npx prisma studio
```

Ini membuka editor data di browser, cocok dipakai sementara sebelum halaman Admin
untuk kelola data master selesai dibuat.

## 8. Rencana lanjutan

- Halaman & fitur untuk role Admin (kelola kelas, siswa, akun guru/kepsek/kurikulum).
- Halaman & fitur untuk role Siswa (lihat materi, kerjakan assessmen, kumpulkan tugas, lihat nilai).
- Halaman & fitur untuk role Kepsek dan Kurikulum.
- Landing page publik ("dashboard pengunjung") sesuai desain Figma.
