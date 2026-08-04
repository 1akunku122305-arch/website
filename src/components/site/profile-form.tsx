"use client";

import { useState } from "react";
import { Card, Button, Field } from "@/components/ui";

interface User {
  id: string;
  email: string;
  name: string;
  whatsapp?: string;
  avatar?: string;
}

export function ProfileForm({ user }: { user?: User }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    whatsapp: user?.whatsapp || "",
  });
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage("Profil berhasil diperbarui!");
      } else {
        setError(data.error || "Gagal memperbarui profil");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Password baru tidak cocok");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (data.ok) {
        setMessage("Password berhasil diubah!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.error || "Gagal mengubah password");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setLoading(true);
    try {
      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.ok) {
        setAvatar(data.data.avatar);
        setMessage("Avatar berhasil diupload!");
      } else {
        setError(data.error || "Gagal upload avatar");
      }
    } catch {
      setError("Gagal upload avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <Card>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-black mb-6">Foto Profil</h2>
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl border-[3px] border-black bg-[#150f28] overflow-hidden flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-4xl text-[#6f6690]">👤</div>
            )}
          </div>
          
          <div>
            <label className="cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                className="hidden" 
              />
              <Button variant="secondary" as="span" disabled={loading}>
                {loading ? "Mengupload..." : "Upload Foto Baru"}
              </Button>
            </label>
            <p className="text-xs text-[#8d83ad] mt-2">Maksimal 2MB • JPG, PNG</p>
          </div>
        </div>
      </Card>

      {/* Profil Info */}
      <Card>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-black mb-6">Informasi Profil</h2>
        
        <form onSubmit={handleProfileUpdate} className="space-y-5">
          <Field label="Nama Lengkap" htmlFor="name">
            <input
              id="name"
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              className="input bg-[#150f28]"
              value={user?.email || ""}
              disabled
            />
            <p className="text-xs text-[#8d83ad] mt-1">Email tidak dapat diubah</p>
          </Field>

          <Field label="Nomor WhatsApp" htmlFor="whatsapp">
            <input
              id="whatsapp"
              type="tel"
              className="input"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="081200000000"
            />
          </Field>

          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </Card>

      {/* Ganti Password */}
      <Card>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-black mb-6">Ganti Password</h2>
        
        <form onSubmit={handlePasswordChange} className="space-y-5">
          <Field label="Password Saat Ini" htmlFor="current">
            <input
              id="current"
              type="password"
              className="input"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </Field>

          <Field label="Password Baru" htmlFor="new">
            <input
              id="new"
              type="password"
              className="input"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              minLength={6}
              required
            />
          </Field>

          <Field label="Konfirmasi Password Baru" htmlFor="confirm">
            <input
              id="confirm"
              type="password"
              className="input"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              minLength={6}
              required
            />
          </Field>

          <Button type="submit" variant="secondary" disabled={loading}>
            {loading ? "Mengubah..." : "Ubah Password"}
          </Button>
        </form>
      </Card>

      {message && <p className="text-center text-[#c3ff3e] font-bold">{message}</p>}
      {error && <p className="text-center text-[#fb7185] font-bold">{error}</p>}
    </div>
  );
}
