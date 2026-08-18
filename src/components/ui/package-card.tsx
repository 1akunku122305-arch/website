'use client';

import { cn } from '@/lib/utils';
import { formatRupiah } from '@/lib/utils';
import { Badge } from './display';

export interface PackageCardData {
  id: string;
  cpu: number;
  ram: number;
  storage: number;
  price: number;
  label?: string;
  popular?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export function PackageCard({
  data,
  selected,
  onSelect,
}: {
  data: PackageCardData;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => !data.disabled && onSelect(data.id)}
      disabled={data.disabled}
      aria-pressed={selected}
      aria-label={data.label}
      className={cn(
        'relative flex w-full flex-col rounded-lg border p-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500',
        selected
          ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800'
          : 'border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600',
        data.disabled && 'pointer-events-none opacity-50',
      )}
    >
      {data.popular && (
        <div className="absolute -top-2 right-3">
          <Badge variant="info">Populer</Badge>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {data.cpu} core · {data.ram} GB · {data.storage} GB
        </p>
      </div>
      <p className="mt-2 text-lg font-semibold">{formatRupiah(data.price)}</p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">per bulan</p>
      {data.disabledReason && <p className="mt-2 text-xs text-amber-600">{data.disabledReason}</p>}
    </button>
  );
}
