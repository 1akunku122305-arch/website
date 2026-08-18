import { type ReactNode } from 'react';
import { Card } from './display';
import { formatRupiah } from '@/lib/utils';

export interface PriceRow {
  label: string;
  value: ReactNode;
  muted?: boolean;
}

export function PriceCard({ title, rows, total, footer }: { title: string; rows: PriceRow[]; total: ReactNode; footer?: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <dl className="space-y-2 px-4 py-4 text-sm">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <dt className={r.muted ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-600 dark:text-neutral-400'}>{r.label}</dt>
            <dd className="font-medium text-neutral-800 dark:text-neutral-200">{r.value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <dt className="font-semibold">Total</dt>
          <dd className="text-lg font-semibold">{total}</dd>
        </div>
      </dl>
      {footer && <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">{footer}</div>}
    </Card>
  );
}

/** Order summary used in the order form and confirmation. */
export function OrderSummary({ config, subtotal, discount, total }: {
  config: Array<{ label: string; value: ReactNode }>;
  subtotal: number;
  discount: number;
  total: number;
}) {
  return (
    <PriceCard
      title="Ringkasan Pesanan"
      rows={config}
      total={total}
      footer={
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400"><span>Diskon</span><span>-{formatRupiah(discount)}</span></div>
        </div>
      }
    />
  );
}
