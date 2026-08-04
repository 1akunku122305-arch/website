"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/components/ui";

interface StockItem {
  id: string;
  name: string;
  type: string;
  stock: number;
  sold: number;
}

export function StockManagementModule() {
  const [stocks, setStocks] = useState<StockItem[]>([
    { id: "dedi-entry", name: "Entry Dedicated", type: "Dedicated", stock: 3, sold: 12 },
    { id: "dedi-pro", name: "Pro Dedicated", type: "Dedicated", stock: 2, sold: 7 },
    { id: "dedi-ultra", name: "Ultra Dedicated", type: "Dedicated", stock: 1, sold: 4 },
  ]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black mb-2">Stock Management</h1>
      <p className="text-[#8d83ad] mb-8">Kelola stok Dedicated Server dan produk fisik</p>

      <div className="grid gap-4">
        {stocks.map((item, index) => (
          <Card key={index} className="flex items-center justify-between">
            <div>
              <div className="font-bold">{item.name}</div>
              <div className="text-xs text-[#8d83ad]">{item.type}</div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-xs text-[#8d83ad]">Stok</div>
                <div className="font-black text-2xl text-[#c3ff3e]">{item.stock}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#8d83ad]">Terjual</div>
                <div className="font-black text-xl">{item.sold}</div>
              </div>
              <div>
                <input 
                  type="number" 
                  value={item.stock} 
                  className="input w-20" 
                  onChange={(e) => {
                    const newStocks = [...stocks];
                    newStocks[index].stock = Number(e.target.value);
                    setStocks(newStocks);
                  }}
                />
              </div>
              <Button variant="secondary" size="sm">Update</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
