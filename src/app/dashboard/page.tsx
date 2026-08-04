import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { read } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel administrasi WangStore.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const db = await read();
  // Password hashes never leave the server.
  const safe = { ...db, users: [] };

  return <DashboardShell initial={safe} session={{ name: session.name, email: session.email, role: session.role }} />;
}
