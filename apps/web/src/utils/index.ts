import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrice(price: number | string | null | undefined): string {
  if (!price) return '价格待议';
  const p = typeof price === 'string' ? parseFloat(price) : price;
  return `¥${p.toLocaleString('zh-CN')}`;
}

export function getPetStatusText(status: string): string {
  const map: Record<string, string> = {
    TRANSIT: '在途',
    IN_STOCK: '在售',
    RESERVED: '预定',
    SOLD: '已售',
    RETURNED: '退回',
    DECEASED: '死亡',
    WHOLESALE: '批发',
  };
  return map[status] || status;
}

export function getPetStatusColor(status: string): string {
  const map: Record<string, string> = {
    TRANSIT: 'bg-yellow-100 text-yellow-800',
    IN_STOCK: 'bg-green-100 text-green-800',
    RESERVED: 'bg-blue-100 text-blue-800',
    SOLD: 'bg-gray-100 text-gray-600',
    RETURNED: 'bg-orange-100 text-orange-800',
    DECEASED: 'bg-red-100 text-red-800',
    WHOLESALE: 'bg-purple-100 text-purple-800',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

export function getHealthStatusText(status: string): string {
  const map: Record<string, string> = {
    HEALTHY: '健康',
    OBSERVATION: '观察中',
    SICK: '生病',
    RECOVERING: '康复中',
  };
  return map[status] || status;
}

export function getHealthStatusColor(status: string): string {
  const map: Record<string, string> = {
    HEALTHY: 'bg-green-100 text-green-800',
    OBSERVATION: 'bg-yellow-100 text-yellow-800',
    SICK: 'bg-red-100 text-red-800',
    RECOVERING: 'bg-blue-100 text-blue-800',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

export function getRoleText(role: string): string {
  const map: Record<string, string> = {
    PLATFORM_ADMIN: '平台管理员',
    TENANT_OWNER: '店主',
    STORE_MANAGER: '店长',
    SALES: '销售',
    KEEPER: '饲养员',
    CUSTOMER: '客户',
  };
  return map[role] || role;
}

export function getTaskPriorityText(priority: string): string {
  const map: Record<string, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
  };
  return map[priority] || priority;
}

export function getTaskPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800',
  };
  return map[priority] || 'bg-gray-100 text-gray-600';
}

export function getTaskTypeText(type: string): string {
  const map: Record<string, string> = {
    FOLLOW_UP: '客户回访',
    VACCINE: '疫苗提醒',
    HEALTH: '健康护理',
    RESERVATION: '预定跟进',
    REPURCHASE: '复购推荐',
    CONTENT: '内容发布',
    SYNC_ISSUE: '同步异常',
    OTHER: '其他任务',
  };
  return map[type] || type;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
