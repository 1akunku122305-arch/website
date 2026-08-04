"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/components/ui";

interface Package {
  id: string;
  name: string;
  tier: string;
  cpu: string;
  ram: string;
  price: number;
  active: boolean;
}

export function PVNodePackagesModule() {
  const [packages, setPackages] = useState<Package[]>([
    { id: "pvnode-lite", name: "Lite", tier: "Xeon E5-2690 v4", cpu: "2-8 Core", ram: "4-16 GB", price: 45000, active: true },
    { id: "pvnode-pro", name: "Pro", tier: "AMD EPYC Rome", cpu: "4-16 Core", ram: "8-32 GB", price: 95000, active: true },
    { id: "pvnode-ultra", name: "Ultra", tier: "Ryzen 9 9950X", cpu: "8-32 Core", ram: "16-64 GB", price: 145000, active: true },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">PVNode Packages</h1>
          <p className="text-[#8d83ad]">Kelola paket PVNode yang tersedia untuk pelanggan</p>
        </div>
        <Button>Tambah Paket</Button>
      </div>

      <div className="grid gap-4">
        {packages.map((pkg, index) => (
          <Card key={index} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-black text-xl">{pkg.name}</span>
                <Badge tone="brand">{pkg.tier}</Badge>
              </div>
              <div className="text-sm text-[#8d83ad] mt-1">{pkg.cpu} • {pkg.ram}</div>
            </div>
            <div className="text-right">
              <div className="font-black text-[#c3ff3e]">Rp {pkg.price.toLocaleString('id-ID')}</div>
              <div className="text-xs">/bulan</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={pkg.active ? "lime" : "muted"}>{pkg.active ? "Aktif" : "Nonaktif"}</Badge>
              <Button variant="secondary" size="sm">Edit</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
