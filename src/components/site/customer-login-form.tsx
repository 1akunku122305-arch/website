"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field } from "@/components/ui";

export function CustomerLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-center">Masuk ke Portal</h1>
      <p className="mt-2 text-center text-sm text-[#8d83ad]">Login untuk melihat riwayat pesanan & tiket</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Field>

        {error && <p className="text-sm text-[#fb7185] font-bold">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Masuk..." : "Masuk ke Portal"}
        </Button>

        <p className="text-center text-sm text-[#8d83ad]">
          Belum punya akun?{" "}
          <a href="/register" className="text-[#c3ff3e] font-bold">Daftar</a>
        </p>
      </form>
    </Card>
  );
}
