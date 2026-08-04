"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/components/ui";

interface Server {
  id: string;
  name: string;
  cpu: string;
  price: number;
  stock: number;
  available: boolean;
}

export function DedicatedServerModule() {
  const [servers, setServers] = useState<Server[]>([
    { id: "dedi-entry", name: "Entry Dedicated", cpu: "Xeon E5-2680 v4", price: 1250000, stock: 3, available: true },
    { id: "dedi-pro", name: "Pro Dedicated", cpu: "EPYC 7402P", price: 2450000, stock: 2, available: true },
    { id: "dedi-ultra", name: "Ultra Dedicated", cpu: "Ryzen 9 7950X", price: 3850000, stock: 1, available: true },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">Dedicated Server</h1>
          <p className="text-[#8d83ad]">Kelola inventaris server fisik (manual stock)</p>
        </div>
        <Button>Tambah Server</Button>
      </div>

      <div className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#241645] text-left text-[#8d83ad]">
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4">CPU</th>
              <th className="py-3 px-4">Harga</th>
              <th className="py-3 px-4">Stok</th>
              <th className="py-3 px-4">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {servers.map((server, i) => (
              <tr key={i} className="border-b border-[#241645]">
                <td className="py-4 px-4 font-bold">{server.name}</td>
                <td className="py-4 px-4">{server.cpu}</td>
                <td className="py-4 px-4 font-black text-[#c3ff3e]">Rp {server.price.toLocaleString('id-ID')}</td>
                <td className="py-4 px-4">
                  <input 
                    type="number" 
                    value={server.stock} 
                    className="input w-20" 
                    onChange={(e) => {
                      const newServers = [...servers];
                      newServers[i].stock = Number(e.target.value);
                      setServers(newServers);
                    }} 
                  />
                </td>
                <td className="py-4 px-4">
                  <Badge tone={server.available ? "lime" : "muted"}>
                    {server.available ? "Tersedia" : "Habis"}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-right">
                  <Button variant="secondary" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
