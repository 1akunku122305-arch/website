import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800', className)}>
      <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-neutral-50 text-left dark:bg-neutral-900">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn('px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 align-middle text-neutral-700 dark:text-neutral-300', className)}>{children}</td>;
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('border-b border-neutral-100 last:border-0 dark:border-neutral-800', className)}>{children}</tr>;
}
