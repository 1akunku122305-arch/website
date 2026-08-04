"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
}

export function OtherServicesModule() {
  const [services, setServices] = useState<Service[]>([
    { id: "svc-ip", name: "Dedicated IPv4", price: 25000, unit: "bulan", category: "Networking" },
    { id: "svc-backup", name: "Extra Backup Retention", price: 45000, unit: "bulan", category: "Storage" },
    { id: "svc-migration", name: "Server Migration", price: 150000, unit: "sekali", category: "Service" },
    { id: "svc-setup", name: "Custom Setup", price: 200000, unit: "sekali", category: "Service" },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">Other Services</h1>
          <p className="text-[#8d83ad]">Layanan tambahan dan add-on</p>
        </div>
        <Button>Tambah Layanan</Button>
      </div>

      <div className="grid gap-4">
        {services.map((service, index) => (
          <Card key={index} className="flex justify-between items-center">
            <div>
              <div className="font-bold">{service.name}</div>
              <div className="text-xs text-[#8d83ad]">{service.category}</div>
            </div>
            <div className="text-right">
              <div className="font-black text-[#c3ff3e]">Rp {service.price.toLocaleString('id-ID')}</div>
              <div className="text-xs">{service.unit}</div>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
