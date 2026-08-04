"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";

interface Package {
  id: string;
  name: string;
  price: number;
  disk: string;
  websites: number;
}

export function SharedHostingModule() {
  const [packages, setPackages] = useState<Package[]>([
    { id: "shared-starter", name: "Starter", price: 35000, disk: "10 GB", websites: 1 },
    { id: "shared-professional", name: "Professional", price: 65000, disk: "25 GB", websites: 5 },
    { id: "shared-business", name: "Business", price: 115000, disk: "50 GB", websites: 15 },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">Shared Hosting</h1>
          <p className="text-[#8d83ad]">Kelola paket Shared Hosting</p>
        </div>
        <Button>Tambah Paket</Button>
      </div>

      <div className="mt-8 grid gap-4">
        {packages.map((pkg, index) => (
          <Card key={index} className="flex justify-between items-center">
            <div>
              <div className="font-black text-xl">{pkg.name}</div>
              <div className="text-sm text-[#8d83ad]">{pkg.disk} • {pkg.websites} website</div>
            </div>
            <div className="text-right">
              <div className="font-black text-[#c3ff3e]">Rp {pkg.price.toLocaleString('id-ID')}</div>
              <div className="text-xs text-[#8d83ad]">/bulan</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Edit</Button>
              <Button variant="ghost" size="sm">Hapus</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
