"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export function PVNodeFormulaModule() {
  const [formula, setFormula] = useState({
    perCore: 8500,
    perGbRam: 3200,
    perGbSsd: 180,
    base: 45000,
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">PVNode Formula</h1>
      <p className="mt-2 text-[#8d83ad]">Konfigurasi harga untuk PVNode (Intel Xeon E5-2690 v4)</p>

      <Card className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Harga per Core</label>
            <input 
              type="number" 
              value={formula.perCore} 
              onChange={(e) => setFormula({...formula, perCore: Number(e.target.value)})} 
              className="input w-full mt-1" 
            />
          </div>
          <div>
            <label className="label">Harga per GB RAM</label>
            <input 
              type="number" 
              value={formula.perGbRam} 
              onChange={(e) => setFormula({...formula, perGbRam: Number(e.target.value)})} 
              className="input w-full mt-1" 
            />
          </div>
          <div>
            <label className="label">Harga per GB SSD</label>
            <input 
              type="number" 
              value={formula.perGbSsd} 
              onChange={(e) => setFormula({...formula, perGbSsd: Number(e.target.value)})} 
              className="input w-full mt-1" 
            />
          </div>
          <div>
            <label className="label">Base Price</label>
            <input 
              type="number" 
              value={formula.base} 
              onChange={(e) => setFormula({...formula, base: Number(e.target.value)})} 
              className="input w-full mt-1" 
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-[#150f28] rounded-xl border border-[#241645]">
          <p className="text-sm font-bold">Preview Harga (2 Core / 4 GB / 20 GB SSD)</p>
          <p className="text-2xl font-black text-[#c3ff3e] mt-1">
            Rp {((formula.base + (2 * formula.perCore) + (4 * formula.perGbRam) + (20 * formula.perGbSsd)) / 1000 * 1000).toLocaleString('id-ID')}
          </p>
        </div>
      </Card>
    </div>
  );
}
