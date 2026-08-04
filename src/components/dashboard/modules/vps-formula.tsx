"use client";

import { useState } from "react";
import { Card } from "@/components/ui";

export function VPSFormulaModule() {
  const [formula, setFormula] = useState({
    perCore: 7800,
    perGbRam: 2900,
    perGbSsd: 160,
    base: 42000,
  });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">VPS Formula</h1>
      <p className="mt-2 text-[#8d83ad]">Konfigurasi harga untuk VPS (Intel Xeon E5-2690 v4)</p>

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
      </Card>
    </div>
  );
}
