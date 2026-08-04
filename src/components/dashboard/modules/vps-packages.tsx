"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";

interface VPSPackage {
  id: string;
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  price: number;
}

export function VPSPackagesModule() {
  const [packages] = useState<VPSPackage[]>([
    { id: "vps-builder", name: "VPS Builder", cpu: "2-16 Core", ram: "4-32 GB", storage: "20-160 GB", price: 42000 },
    { id: "vps-standard", name: "Standard", cpu: "4 Core", ram: "8 GB", storage: "80 GB", price: 125000 },
    { id: "vps-premium", name: "Premium", cpu: "8 Core", ram: "16 GB", storage: "160 GB", price: 245000 },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">VPS Packages</h1>
          <p className="text-[#8d83ad]">Paket VPS siap pakai dan custom builder</p>
        </div>
        <Button>Tambah Paket VPS</Button>
      </div>

      <div className="grid gap-4">
        {packages.map((pkg, index) => (
          <Card key={index} className="flex justify-between items-center">
            <div>
              <div className="font-black text-xl">{pkg.name}</div>
              <div className="text-sm text-[#8d83ad] mt-1">{pkg.cpu} • {pkg.ram} • {pkg.storage}</div>
            </div>
            <div>
              <div className="font-black text-[#c3ff3e] text-right">Rp {pkg.price.toLocaleString('id-ID')}</div>
              <div className="text-xs text-right">/bulan</div>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
