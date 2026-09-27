import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data contoh LMS Sekolah...");

  const passwordHash = await bcrypt.hash("guru123", 10);

  // --- Mata pelajaran ---
  const bahasaIndonesia = await prisma.mataPelajaran.upsert({
    where: { nama: "Bahasa Indonesia" },
    update: {},
    create: { nama: "Bahasa Indonesia" },
  });
  const matematika = await prisma.mataPelajaran.upsert({
    where: { nama: "Matematika" },
    update: {},
    create: { nama: "Matematika" },
  });

  // --- Kelas ---
  const kelas1 = await prisma.kelas.upsert({
    where: { nama: "XII PPLG 1" },
    update: {},
    create: { nama: "XII PPLG 1", jurusan: "PPLG" },
  });
  const kelas2 = await prisma.kelas.upsert({
    where: { nama: "XII PPLG 2" },
    update: {},
    create: { nama: "XII PPLG 2", jurusan: "PPLG" },
  });

  // --- Akun guru contoh ---
  const guru = await prisma.user.upsert({
    where: { email: "guru@lmssekolah.test" },
    update: {},
    create: {
      namaLengkap: "Bu Sari Wulandari",
      email: "guru@lmssekolah.test",
      username: "guru.sari",
      passwordHash,
      role: "GURU",
    },
  });

  // Guru ini mengampu Bahasa Indonesia di kedua kelas, dan Matematika di kelas 1.
  await prisma.guruMataPelajaran.upsert({
    where: {
      guruId_kelasId_mataPelajaranId: {
        guruId: guru.id,
        kelasId: kelas1.id,
        mataPelajaranId: bahasaIndonesia.id,
      },
    },
    update: {},
    create: { guruId: guru.id, kelasId: kelas1.id, mataPelajaranId: bahasaIndonesia.id },
  });
  await prisma.guruMataPelajaran.upsert({
    where: {
      guruId_kelasId_mataPelajaranId: {
        guruId: guru.id,
        kelasId: kelas2.id,
        mataPelajaranId: bahasaIndonesia.id,
      },
    },
    update: {},
    create: { guruId: guru.id, kelasId: kelas2.id, mataPelajaranId: bahasaIndonesia.id },
  });
  await prisma.guruMataPelajaran.upsert({
    where: {
      guruId_kelasId_mataPelajaranId: {
        guruId: guru.id,
        kelasId: kelas1.id,
        mataPelajaranId: matematika.id,
      },
    },
    update: {},
    create: { guruId: guru.id, kelasId: kelas1.id, mataPelajaranId: matematika.id },
  });

  // --- Siswa ---
  const dataSiswa = [
    { nisn: "0071234501", namaLengkap: "Ahmad Fauzi", kehadiranPersen: 95, kelasId: kelas1.id },
    { nisn: "0071234502", namaLengkap: "Adinda Seviana", kehadiranPersen: 98, kelasId: kelas1.id },
    { nisn: "0071234503", namaLengkap: "Fathya Putri Ayudya", kehadiranPersen: 80, kelasId: kelas1.id },
    { nisn: "0071234504", namaLengkap: "Nadya Putri", kehadiranPersen: 92, kelasId: kelas2.id },
    { nisn: "0071234505", namaLengkap: "Bima Saputra", kehadiranPersen: 88, kelasId: kelas2.id },
  ];

  const siswaByNisn: Record<string, string> = {};
  for (const s of dataSiswa) {
    const siswa = await prisma.siswa.upsert({
      where: { nisn: s.nisn },
      update: {},
      create: s,
    });
    siswaByNisn[s.nisn] = siswa.id;
  }

  // --- Contoh Tugas: "Esai Teks Argumentasi" untuk kelas 2 ---
  const tugasExisting = await prisma.tugas.findFirst({
    where: { judul: "Esai Teks Argumentasi", kelasId: kelas2.id },
  });
  if (!tugasExisting) {
    const siswaKelas2 = await prisma.siswa.findMany({ where: { kelasId: kelas2.id } });
    await prisma.tugas.create({
      data: {
        judul: "Esai Teks Argumentasi",
        deskripsi: "Tulis esai argumentasi minimal 500 kata.",
        kelasId: kelas2.id,
        mataPelajaranId: bahasaIndonesia.id,
        guruId: guru.id,
        batasKumpul: new Date("2026-08-02"),
        pengumpulan: {
          create: siswaKelas2.map((s) => {
            if (s.nisn === "0071234504") {
              return {
                siswaId: s.id,
                status: "SUDAH_KUMPUL" as const,
                formatKumpul: "PDF + Link",
                waktuKumpul: new Date("2026-07-27T09:02:00"),
                nilai: null,
              };
            }
            if (s.nisn === "0071234501") {
              return {
                siswaId: s.id,
                status: "SUDAH_KUMPUL" as const,
                formatKumpul: "PDF",
                waktuKumpul: new Date("2026-07-26T20:14:00"),
                nilai: 88,
              };
            }
            return { siswaId: s.id };
          }),
        },
      },
    });
  }

  // --- Contoh Assessmen: Kuis (selesai dinilai) & Ujian (perlu dinilai) ---
  const kuisExisting = await prisma.assessmen.findFirst({
    where: { judul: "Kuis Aljabar Bab 3" },
  });
  if (!kuisExisting) {
    const siswaKelas2 = await prisma.siswa.findMany({ where: { kelasId: kelas2.id } });
    await prisma.assessmen.create({
      data: {
        judul: "Kuis Aljabar Bab 3",
        tipe: "KUIS",
        kelasId: kelas2.id,
        mataPelajaranId: matematika.id,
        guruId: guru.id,
        statusPenilaian: "SELESAI_DINILAI",
        hasil: {
          create: siswaKelas2.map((s) => ({
            siswaId: s.id,
            sudahKerjakan: true,
            nilai: 90,
          })),
        },
      },
    });
  }

  const ujianExisting = await prisma.assessmen.findFirst({
    where: { judul: "Ujian Tengah Semester" },
  });
  if (!ujianExisting) {
    const siswaKelas1 = await prisma.siswa.findMany({ where: { kelasId: kelas1.id } });
    await prisma.assessmen.create({
      data: {
        judul: "Ujian Tengah Semester",
        tipe: "UJIAN",
        kelasId: kelas1.id,
        mataPelajaranId: bahasaIndonesia.id,
        guruId: guru.id,
        statusPenilaian: "PERLU_DINILAI",
        hasil: {
          create: siswaKelas1.map((s) => ({
            siswaId: s.id,
            sudahKerjakan: true,
            nilai: null,
          })),
        },
      },
    });
  }

  console.log("Selesai. Login guru contoh:");
  console.log("  Email/Username : guru@lmssekolah.test / guru.sari");
  console.log("  Password       : guru123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
