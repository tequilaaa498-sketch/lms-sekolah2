import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SiteFooter } from "@/components/SiteFooter";
import { GuruNav } from "./GuruNav";

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "GURU") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <GuruNav namaLengkap={session.namaLengkap} />
      <main className="flex-1 bg-lms-bg">
        <div className="mx-auto max-w-6xl px-6 py-14">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
