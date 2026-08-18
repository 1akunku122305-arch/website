import type { Role } from '@/lib/types';

/**
 * Role Based Access Control — single permission matrix.
 * Owner > Admin > Staff only expresses hierarchy; authorization is based on
 * explicit permissions. No role/permission is ever trusted from the browser.
 */

export type Permission =
  | 'orders:read'
  | 'orders:write'
  | 'customers:read'
  | 'customers:write'
  | 'pricing:read'
  | 'pricing:write'
  | 'coupons:read'
  | 'coupons:write'
  | 'products:read'
  | 'products:write'
  | 'vps:read'
  | 'vps:write'
  | 'services:read'
  | 'services:write'
  | 'services:lifecycle'
  | 'cms:read'
  | 'cms:write'
  | 'analytics:read'
  | 'audit:read'
  | 'roles:manage'
  | 'users:read'
  | 'users:write'
  | 'tickets:read'
  | 'tickets:write'
  | 'settings:write'
  | 'status:read'
  | 'status:write'
  | 'legal:write'
  | 'reminders:manage';

const OWNER: Permission[] = [
  'orders:read', 'orders:write', 'customers:read', 'customers:write',
  'pricing:read', 'pricing:write', 'coupons:read', 'coupons:write',
  'products:read', 'products:write', 'vps:read', 'vps:write',
  'services:read', 'services:write', 'services:lifecycle', 'cms:read', 'cms:write',
  'analytics:read', 'audit:read', 'roles:manage', 'users:read', 'users:write',
  'tickets:read', 'tickets:write', 'settings:write', 'status:read', 'status:write',
  'legal:write', 'reminders:manage',
];

const ADMIN: Permission[] = [
  'orders:read', 'orders:write', 'customers:read', 'customers:write',
  'pricing:read', 'pricing:write', 'coupons:read', 'coupons:write',
  'products:read', 'products:write', 'vps:read', 'vps:write',
  'services:read', 'services:write', 'services:lifecycle', 'cms:read', 'cms:write',
  'analytics:read', 'audit:read', 'users:read', 'tickets:read', 'tickets:write',
  'settings:write', 'status:read', 'status:write', 'legal:write', 'reminders:manage',
  // roles:manage is Owner-only
];

const STAFF: Permission[] = [
  'orders:read', 'customers:read', 'products:read', 'vps:read', 'services:read',
  'cms:read', 'analytics:read', 'tickets:read', 'tickets:write', 'status:read',
  // No write access to pricing, coupons, roles, audit, lifecycle, settings.
];

const CUSTOMER: Permission[] = ['orders:read'];

const MATRIX: Record<Role, Permission[]> = {
  owner: OWNER,
  admin: ADMIN,
  staff: STAFF,
  customer: CUSTOMER,
};

export function permissionsFor(role: Role): Permission[] {
  return MATRIX[role] ?? CUSTOMER;
}

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return permissionsFor(role).includes(permission);
}

export function requirePermission(role: Role | null | undefined, permission: Permission): boolean {
  return hasPermission(role, permission);
}

/** True if role is one of the staff roles (owner/admin/staff). */
export function isStaffRole(role: Role): boolean {
  return role === 'owner' || role === 'admin' || role === 'staff';
}

/** Owner-only. */
export function isOwner(role: Role): boolean {
  return role === 'owner';
}

/** Admin or owner. */
export function isAdminRole(role: Role): boolean {
  return role === 'owner' || role === 'admin';
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 3,
  admin: 2,
  staff: 1,
  customer: 0,
};

export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  if (!isOwner(actorRole)) return false;
  return ROLE_HIERARCHY[targetRole] < ROLE_HIERARCHY[actorRole];
}
