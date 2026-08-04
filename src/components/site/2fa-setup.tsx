"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";

export function TwoFactorSetup() {
  const [secret, setSecret] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function setup2FA() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      
      if (data.ok) {
        setSecret(data.data.secret);
        setQrUrl(data.data.otpauth_url);
      }
    } catch (e) {
      setMessage("Gagal setup 2FA");
    } finally {
      setLoading(false);
    }
  }

  async function verify2FA() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });
      
      const data = await res.json();
      if (data.ok) {
        setEnabled(true);
        setMessage("2FA berhasil diaktifkan!");
      } else {
        setMessage("Kode salah");
      }
    } catch {
      setMessage("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function disable2FA() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setEnabled(false);
        setSecret("");
        setQrUrl("");
        setMessage("2FA dinonaktifkan");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="font-black text-xl mb-4">Two-Factor Authentication (2FA)</h3>
      
      {!secret && !enabled && (
        <Button onClick={setup2FA} disabled={loading}>
          Aktifkan 2FA
        </Button>
      )}

      {secret && !enabled && (
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">Scan QR Code ini dengan aplikasi Authenticator (Google Authenticator / Authy):</p>
            <div className="bg-white p-4 inline-block rounded">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} 
                alt="2FA QR Code" 
              />
            </div>
          </div>

          <div>
            <p className="text-sm mb-1">Atau masukkan kode manual:</p>
            <code className="bg-[#150f28] p-2 rounded text-[#c3ff3e] block">{secret}</code>
          </div>

          <div>
            <input
              type="text"
              placeholder="Masukkan kode 6 digit"
              className="input w-48"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <Button onClick={verify2FA} className="ml-3" disabled={loading || code.length !== 6}>
              Verifikasi & Aktifkan
            </Button>
          </div>
        </div>
      )}

      {enabled && (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#c3ff3e] font-bold">✓ 2FA Aktif</span>
            <p className="text-xs text-[#8d83ad]">Akun Anda dilindungi dengan 2FA</p>
          </div>
          <Button variant="ghost" onClick={disable2FA} disabled={loading}>
            Nonaktifkan 2FA
          </Button>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-[#c3ff3e]">{message}</p>}
    </Card>
  );
}
