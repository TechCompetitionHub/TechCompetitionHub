import type { EquipmentRequirement } from './schemas';

export const EQUIPMENT_LABELS: Record<EquipmentRequirement, string> = {
  none: '无需设备',
  off_the_shelf: '成品设备',
  self_built: '自制设备',
  unknown: '未知',
};

export const EQUIPMENT_DESCRIPTIONS: Record<EquipmentRequirement, string> = {
  none: '主要使用电脑、软件或在线环境，不需要专用硬件。',
  off_the_shelf: '使用商用开发板、实验箱、成套设备或主办方提供的硬件。',
  self_built: '需要团队自行制作机器人、电路、机械装置或其它硬件。',
  unknown: '设备要求尚未在官方来源中确认，使用前请查看当届通知。',
};

export const EQUIPMENT_OPTIONS: Array<{
  value: EquipmentRequirement;
  label: string;
  description: string;
}> = (Object.keys(EQUIPMENT_LABELS) as EquipmentRequirement[]).map((value) => ({
  value,
  label: EQUIPMENT_LABELS[value],
  description: EQUIPMENT_DESCRIPTIONS[value],
}));

export function equipmentLabel(value: EquipmentRequirement): string {
  return EQUIPMENT_LABELS[value];
}
