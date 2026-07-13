export const Role = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  TENANT_OWNER: 'TENANT_OWNER',
  STORE_MANAGER: 'STORE_MANAGER',
  SALES: 'SALES',
  KEEPER: 'KEEPER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = typeof Role[keyof typeof Role];

export const PetStatus = {
  TRANSIT: 'TRANSIT',
  IN_STOCK: 'IN_STOCK',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
  RETURNED: 'RETURNED',
  DECEASED: 'DECEASED',
  WHOLESALE: 'WHOLESALE',
} as const;

export type PetStatus = typeof PetStatus[keyof typeof PetStatus];

export const Species = {
  CAT: 'CAT',
  DOG: 'DOG',
  OTHER: 'OTHER',
} as const;

export type Species = typeof Species[keyof typeof Species];

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

export type Gender = typeof Gender[keyof typeof Gender];

export const TaskType = {
  FOLLOW_UP: 'FOLLOW_UP',
  VACCINE: 'VACCINE',
  HEALTH: 'HEALTH',
  RESERVATION: 'RESERVATION',
  REPURCHASE: 'REPURCHASE',
  CONTENT: 'CONTENT',
  SYNC_ISSUE: 'SYNC_ISSUE',
  OTHER: 'OTHER',
} as const;

export type TaskType = typeof TaskType[keyof typeof TaskType];

export const TaskPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export const TaskStatus = {
  TODO: 'TODO',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskResult = {
  SENT: 'SENT',
  REPLIED: 'REPLIED',
  APPOINTED: 'APPOINTED',
  DEAL_DONE: 'DEAL_DONE',
  NOT_NEEDED: 'NOT_NEEDED',
  NEED_MANAGER: 'NEED_MANAGER',
} as const;

export type TaskResult = typeof TaskResult[keyof typeof TaskResult];

export const TaskSource = {
  AI: 'AI',
  MANUAL: 'MANUAL',
  SYSTEM: 'SYSTEM',
} as const;

export type TaskSource = typeof TaskSource[keyof typeof TaskSource];

export const FeishuSyncStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
} as const;

export type FeishuSyncStatus = typeof FeishuSyncStatus[keyof typeof FeishuSyncStatus];

export const HealthStatus = {
  HEALTHY: 'HEALTHY',
  OBSERVATION: 'OBSERVATION',
  SICK: 'SICK',
  RECOVERING: 'RECOVERING',
} as const;

export type HealthStatus = typeof HealthStatus[keyof typeof HealthStatus];

export const SalesOrderStatus = {
  COMPLETED: 'COMPLETED',
  CORRECTED: 'CORRECTED',
  CANCELED: 'CANCELED',
} as const;

export type SalesOrderStatus = typeof SalesOrderStatus[keyof typeof SalesOrderStatus];

export const TenantStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
} as const;

export type TenantStatus = typeof TenantStatus[keyof typeof TenantStatus];

export const StoreStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type StoreStatus = typeof StoreStatus[keyof typeof StoreStatus];

export const RiskLevel = {
  NONE: 'NONE',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];
