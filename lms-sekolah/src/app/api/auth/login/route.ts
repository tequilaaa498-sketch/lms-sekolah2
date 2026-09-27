import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email/username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  role: z.enum(["ADMIN", "GURU", "SISWA", "KEPSEK", "KURIKULUM"]),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data yang dikirim tidak valid." },
      { status: 400 }
    );
  }

  const { identifier, password, role } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      role,
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Akun tidak ditemukan untuk role ini." },
      { status: 401 }
    );
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return NextResponse.json(
      { message: "Email/username atau password salah." },
      { status: 401 }
    );
  }

  await createSession({
    userId: user.id,
    namaLengkap: user.namaLengkap,
    role: user.role,
  });

  const redirectPath =
    {
      ADMIN: "/admin",
      GURU: "/guru",
      SISWA: "/siswa",
      KEPSEK: "/kepsek",
      KURIKULUM: "/kurikulum",
    }[user.role] ?? "/";

  return NextResponse.json({ redirectPath });
}
