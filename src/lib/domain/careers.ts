import type { Company } from './types';

export type PreferenceStatus =
  'direct_channel' | 'priority' | 'plus' | 'no_public_channel' | 'unknown';

export const PREFERENCE_STATUS_LABELS: Record<PreferenceStatus, string> = {
  direct_channel: '直通面试',
  priority: '明确优先',
  plus: '可参与/加分',
  no_public_channel: '官网未公开',
  unknown: '待核验',
};

export const PREFERENCE_STATUS_DESCRIPTIONS: Record<PreferenceStatus, string> = {
  direct_channel: '官方页面明确写出直通面试、免笔试或同等权益。',
  priority: '官方页面明确写出优先/倾斜条款。',
  plus: '官方页面允许参与专属通道或作为加分项，但不保证直通。',
  no_public_channel: '已查看的官方招聘入口没有公开相关条款。',
  unknown: '尚未找到公开条款，不能据此推断企业政策。',
};

export function preferenceStatusLabel(status: PreferenceStatus): string {
  return PREFERENCE_STATUS_LABELS[status];
}

export function hasDirectChannel(company: Company): boolean {
  return company.competition_preferences.some(
    (preference) => preference.status === 'direct_channel' || preference.status === 'priority',
  );
}
