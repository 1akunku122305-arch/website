import type { Order, ServiceInstance, ServiceStatus, ServiceRenewal } from '@/lib/types';
import type { ReminderType } from '@/lib/types';
import { generateId } from '@/lib/utils';

/**
 * Service lifecycle — single source of truth for activation, expiration,
 * status transitions, reminders, and renewals. All decisions use server time.
 */

export const DEFAULT_SERVICE_DAYS = 30;

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function isInPast(iso: string, reference = nowIso()): boolean {
  return iso <= reference;
}

export interface ServiceWindow {
  activationAt: string;
  expiresAt: string;
  status: ServiceStatus;
}

/**
 * Determine the effective service status and window from activation/expiration
 * using server time. An arbitrary status change from the client is ignored.
 */
export function resolveServiceStatus(service: {
  activationAt: string;
  expiresAt: string;
  status: ServiceStatus;
}, reference = nowIso()): ServiceWindow {
  let status: ServiceStatus = service.status;

  // Hard lifecycle rules that cannot be overridden by stored status.
  if (status === 'terminated' || status === 'cancelled') {
    return { activationAt: service.activationAt, expiresAt: service.expiresAt, status };
  }

  if (service.activationAt > reference) {
    status = 'scheduled';
  } else {
    // activation time reached → active (unless explicitly suspended)
    if (status === 'pending' || status === 'scheduled') {
      status = 'active';
    }
  }

  if (service.expiresAt <= reference) {
    status = 'expired';
  }

  return { activationAt: service.activationAt, expiresAt: service.expiresAt, status };
}

/** Remaining duration in whole days (floor), based on server time. */
export function remainingDays(service: { expiresAt: string }, reference = nowIso()): number {
  const diff = new Date(service.expiresAt).getTime() - new Date(reference).getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Compute activation/expiration for a newly created service.
 * `activationAt` may be in the future (scheduled) or now (active).
 * `durationDays` drives expires_at.
 */
export function createServiceWindow(input: {
  activationAt?: string;
  durationDays: number;
  reference?: string;
}): { activationAt: string; expiresAt: string } {
  const reference = input.reference ?? nowIso();
  const activationAt = input.activationAt && input.activationAt > reference ? input.activationAt : reference;
  const expiresAt = addDays(activationAt, input.durationDays);
  return { activationAt, expiresAt };
}

/**
 * Renewal expiration per business rules (server time).
 * - Active service: new_expires_at = current_expires_at + duration
 * - Expired service: new_activation_at = server now; new_expires_at = now + duration
 */
export function computeRenewalWindow(
  service: { activationAt: string; expiresAt: string; status: ServiceStatus },
  durationDays: number,
  reference = nowIso(),
): { activationAt: string; expiresAt: string; oldExpiresAt: string } {
  const resolved = resolveServiceStatus(service, reference);
  const oldExpiresAt = service.expiresAt;
  if (resolved.status === 'expired') {
    const activationAt = reference;
    return { activationAt, expiresAt: addDays(activationAt, durationDays), oldExpiresAt };
  }
  // Active or scheduled → extend from current expiration.
  return {
    activationAt: service.activationAt,
    expiresAt: addDays(service.expiresAt, durationDays),
    oldExpiresAt,
  };
}

/** Default reminder schedule offsets (days before expiration) + expired event. */
export const REMINDER_OFFSETS: { type: ReminderType; daysBefore: number }[] = [
  { type: 'expiring_7d', daysBefore: 7 },
  { type: 'expiring_3d', daysBefore: 3 },
  { type: 'expiring_1d', daysBefore: 1 },
  { type: 'expired', daysBefore: 0 },
];

/**
 * Compute the scheduled time for a reminder event relative to expires_at.
 * `expired` reminder is scheduled for the expiration moment.
 */
export function reminderScheduledAt(service: { expiresAt: string }, reminderType: ReminderType): string {
  const expiry = new Date(service.expiresAt);
  if (reminderType === 'expired') {
    return service.expiresAt;
  }
  const offset = REMINDER_OFFSETS.find((r) => r.type === reminderType);
  const days = offset?.daysBefore ?? 7;
  const d = new Date(expiry);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/** Whether a renewal is allowed for a service. */
export function canRenew(service: Pick<ServiceInstance, 'renewable' | 'status'>): boolean {
  if (!service.renewable) return false;
  return !['terminated', 'cancelled'].includes(service.status);
}

/** Build a renewal record draft (does not persist). */
export function buildRenewalDraft(input: {
  order: Order;
  service: ServiceInstance;
  durationDays: number;
}): ServiceRenewal {
  const { order, service } = input;
  const durationDays = input.durationDays;
  const window = computeRenewalWindow(service, durationDays);
  return {
    id: generateId('renewal'),
    serviceId: service.id,
    orderId: order.id,
    duration: durationDays,
    oldExpiresAt: window.oldExpiresAt,
    newExpiresAt: window.expiresAt,
    price: order.total,
    status: 'pending',
    createdAt: nowIso(),
  };
}
