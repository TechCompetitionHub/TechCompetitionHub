import type { VerificationStatus } from '../domain/types';

const STATUS_LABELS: Record<VerificationStatus, string> = {
  draft: '草稿',
  needs_review: '待核验',
  verified: '已核验',
  stale: '可能过期',
  rejected: '已拒绝',
};

const STATUS_TONES: Record<VerificationStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  draft: 'neutral',
  needs_review: 'warning',
  verified: 'success',
  stale: 'warning',
  rejected: 'danger',
};

const STATUS_ICONS: Record<VerificationStatus, string> = {
  draft: '○',
  needs_review: '?',
  verified: '✓',
  stale: '!',
  rejected: '×',
};

export function statusLabel(status: VerificationStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function statusTone(
  status: VerificationStatus,
): 'neutral' | 'warning' | 'success' | 'danger' {
  return STATUS_TONES[status] ?? 'neutral';
}

export function statusIcon(status: VerificationStatus): string {
  return STATUS_ICONS[status] ?? '•';
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '待核验';
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(1);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatHours(value: number | null | undefined): string {
  if (!value) return '待补充';
  return `${value} 小时`;
}

export function levelLabel(level: number): string {
  return (
    ['L0 尚未接触', 'L1 跟随教程', 'L2 独立完成', 'L3 调试与取舍', 'L4 设计与指导'][level] ??
    `L${level}`
  );
}

export function domainLabel(domain: string, labels: ReadonlyMap<string, string>): string {
  return labels.get(domain) ?? domain;
}

export function externalLinkLabel(host: string): string {
  return host || '外部链接';
}
