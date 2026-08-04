"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";

interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export function MediaManagerModule() {
  const [files] = useState<MediaFile[]>([
    { id: "m1", name: "logo.svg", type: "image/svg", size: "12 KB", uploadedAt: "2026-01-10" },
    { id: "m2", name: "mascot.png", type: "image/png", size: "245 KB", uploadedAt: "2026-01-08" },
    { id: "m3", name: "hero-bg.jpg", type: "image/jpeg", size: "1.2 MB", uploadedAt: "2026-01-05" },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">Media Manager</h1>
          <p className="text-[#8d83ad]">Upload dan kelola file (logo, gambar, dokumen)</p>
        </div>
        <Button>Upload File</Button>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#241645] text-left text-[#8d83ad]">
              <th className="py-3">Nama File</th>
              <th className="py-3">Tipe</th>
              <th className="py-3">Ukuran</th>
              <th className="py-3">Diunggah</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, i) => (
              <tr key={i} className="border-b border-[#241645]">
                <td className="py-4 font-medium">{file.name}</td>
                <td className="py-4 text-[#8d83ad]">{file.type}</td>
                <td className="py-4">{file.size}</td>
                <td className="py-4 text-[#8d83ad]">{file.uploadedAt}</td>
                <td className="py-4 text-right">
                  <Button variant="ghost" size="sm">Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
