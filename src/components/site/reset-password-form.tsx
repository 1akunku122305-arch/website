"use client";

import { useState } from "react";
import { Button, Card, Field } from "@/components/ui";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <Card>
        <h1 className="text-2xl font-black text-center">Link Terkirim</h1>
        <p className="mt-4 text-center text-[#8d83ad]">
          Jika email terdaftar, link reset password telah dikirim.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-center">Reset Password</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </Button>
      </form>
    </Card>
  );
}
