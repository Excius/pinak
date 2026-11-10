export type OptionValueRecord = {
  id: string;
  optionId?: string;
  value: string;
  sortOrder: number;
  swatchColorHex?: string | null;
  weightGrams?: number | null;
  weightClassId?: string | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  lengthClassId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type OptionRecord = {
  id: string;
  name: string;
  sortOrder: number;
  values?: OptionValueRecord[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type PublicOptionValue = {
  id: string;
  value: string;
  sortOrder: number;
  swatchColorHex?: string | null;
};

export type PublicOption = {
  id: string;
  name: string;
  sortOrder: number;
  values: PublicOptionValue[];
};

export type AdminOptionValue = {
  id: string;
  optionId?: string;
  value: string;
  sortOrder: number;
  swatchColorHex?: string | null;
  weightGrams?: number | null;
  weightClassId?: string | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  lengthClassId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AdminOption = {
  id: string;
  name: string;
  sortOrder: number;
  values: AdminOptionValue[];
  createdAt?: Date;
  updatedAt?: Date;
};

export const toPublicOptionValue = (value: OptionValueRecord): PublicOptionValue => ({
  id: value.id,
  value: value.value,
  sortOrder: value.sortOrder,
  swatchColorHex: value.swatchColorHex ?? null,
});

export const toPublicOption = (option: OptionRecord): PublicOption => ({
  id: option.id,
  name: option.name,
  sortOrder: option.sortOrder,
  values: (option.values ?? []).map(toPublicOptionValue),
});

export const toPublicOptionList = (options: OptionRecord[]): PublicOption[] =>
  options.map(toPublicOption);

export const toAdminOptionValue = (value: OptionValueRecord): AdminOptionValue => ({
  id: value.id,
  ...(value.optionId !== undefined && { optionId: value.optionId }),
  value: value.value,
  sortOrder: value.sortOrder,
  swatchColorHex: value.swatchColorHex ?? null,
  weightGrams: value.weightGrams ?? null,
  weightClassId: value.weightClassId ?? null,
  dimensionLength: value.dimensionLength ?? null,
  dimensionWidth: value.dimensionWidth ?? null,
  dimensionHeight: value.dimensionHeight ?? null,
  lengthClassId: value.lengthClassId ?? null,
  ...(value.createdAt !== undefined && { createdAt: value.createdAt }),
  ...(value.updatedAt !== undefined && { updatedAt: value.updatedAt }),
});

export const toAdminOption = (option: OptionRecord): AdminOption => ({
  id: option.id,
  name: option.name,
  sortOrder: option.sortOrder,
  values: (option.values ?? []).map(toAdminOptionValue),
  ...(option.createdAt !== undefined && { createdAt: option.createdAt }),
  ...(option.updatedAt !== undefined && { updatedAt: option.updatedAt }),
});

export const toAdminOptionList = (options: OptionRecord[]): AdminOption[] =>
  options.map(toAdminOption);
