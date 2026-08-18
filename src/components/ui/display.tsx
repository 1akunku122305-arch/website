import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info';

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export function Badge({ children, variant = 'neutral', className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', badgeVariants[variant], className)}>
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900', className)}>{children}</div>;
}

export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-200 p-4 dark:border-neutral-800">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const alertVariants: Record<AlertVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200',
};

export function Alert({ children, variant = 'info', title, className }: { children: ReactNode; variant?: AlertVariant; title?: string; className?: string }) {
  return (
    <div role="alert" className={cn('rounded-md border px-4 py-3 text-sm', alertVariants[variant], className)}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800', className)} />;
}

export function LoadingState({ label = 'Memuat…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-500 dark:text-neutral-400" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ title = 'Terjadi kesalahan', message, retry }: { title?: string; message?: string; retry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">{message}</p>}
      {retry && (
        <button className="btn btn-secondary mt-2" onClick={retry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-14 text-center dark:border-neutral-700">
      <p className="text-base font-medium">{title}</p>
      {description && <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {sub && <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{sub}</p>}
        </div>
        {icon && <div className="text-neutral-400 dark:text-neutral-500">{icon}</div>}
      </div>
    </Card>
  );
}
