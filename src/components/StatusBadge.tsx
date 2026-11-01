import type { ReactNode } from 'react';
import { Badge } from './Badge';
import { statusIcon, statusLabel, statusTone } from '../lib/utils/format';
import type { VerificationStatus } from '../lib/domain/types';

export function StatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <Badge tone={statusTone(status)}>
      <span aria-hidden="true">{statusIcon(status)}</span>
      <span>{statusLabel(status)}</span>
    </Badge>
  );
}

export function EvidenceBadge({
  level,
  children,
}: {
  level: 'high' | 'medium' | 'low';
  children?: ReactNode;
}) {
  const tone = level === 'high' ? 'success' : level === 'medium' ? 'warning' : 'danger';
  const label = level === 'high' ? '高' : level === 'medium' ? '中' : '低';
  return (
    <Badge tone={tone}>
      <span aria-hidden="true">◐</span>
      <span>{children ?? `证据完整度：${label}`}</span>
    </Badge>
  );
}

export function ScoreStatusBadge({
  status,
}: {
  status: 'official' | 'provisional' | 'ineligible';
}) {
  if (status === 'official') return <Badge tone="success">正式评分</Badge>;
  if (status === 'provisional') return <Badge tone="warning">暂定分 · 不参与排名</Badge>;
  return <Badge tone="neutral">资料不足</Badge>;
}
