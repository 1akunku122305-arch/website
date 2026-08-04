"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field } from "@/components/ui";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Gagal mendaftar");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-center">Daftar Akun</h1>
      <p className="mt-2 text-center text-sm text-[#8d83ad]">Buat akun untuk mengakses portal pelanggan</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Nama Lengkap" htmlFor="name">
          <input
            id="name"
            type="text"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Field>

        <Field label="Nomor WhatsApp" htmlFor="wa">
          <input
            id="wa"
            type="tel"
            className="input"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="081200000000"
            required
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />
        </Field>

        {error && <p className="text-sm text-[#fb7185] font-bold">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Mendaftar..." : "Daftar Sekarang"}
        </Button>

        <p className="text-center text-sm text-[#8d83ad]">
          Sudah punya akun?{" "}
          <a href="/login" className="text-[#c3ff3e] font-bold">Masuk</a>
        </p>
      </form>
    </Card>
  );
}
