export type SettingRecord = {
  id: string;
  key: string;
  value: string;
  group: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const toSettingItem = (setting: SettingRecord) => ({
  id: setting.id,
  key: setting.key,
  value: setting.value,
  group: setting.group,
  description: setting.description,
  isPublic: setting.isPublic,
  createdAt: setting.createdAt,
  updatedAt: setting.updatedAt,
});

export const toPublicSettingsRecord = (
  settings: SettingRecord[],
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
};
