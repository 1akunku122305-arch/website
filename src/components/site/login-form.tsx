"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { Button, Card, Field } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(json.error as string);
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-gradient-to-br from-[#d946ef] to-[#7c3aed] shadow-[3px_3px_0_0_#000]">
          <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.6} />
        </span>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-black">Masuk Dashboard</h1>
          <p className="text-xs text-[#8d83ad]">Akses khusus Owner, Admin, dan Staff.</p>
        </div>
      </div>

      <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
        <Field label="Email" htmlFor="l-email">
          <input
            id="l-email"
            type="email"
            className="input"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Kata Sandi" htmlFor="l-pass">
          <input
            id="l-pass"
            type="password"
            className="input"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error ? (
          <p role="alert" className="rounded-xl border-2 border-[#f43f5e] bg-[#2a0f1a] px-4 py-3 text-sm font-bold text-[#fb7185]">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-[11px] leading-relaxed text-[#6f6690]">
        Kredensial awal dibuat oleh installer dan wajib diganti setelah login pertama. Percobaan login dibatasi 6 kali
        per 5 menit per alamat IP dan seluruh upaya tercatat pada Audit Log.
      </p>
    </Card>
  );
}
