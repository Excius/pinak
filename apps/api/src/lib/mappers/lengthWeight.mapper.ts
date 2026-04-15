export type LengthClassRecord = {
  id: string;
  name: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WeightClassRecord = {
  id: string;
  name: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicLengthClass = Omit<
  LengthClassRecord,
  "createdAt" | "updatedAt"
>;
export type AdminLengthClass = LengthClassRecord;

export type PublicWeightClass = Omit<
  WeightClassRecord,
  "createdAt" | "updatedAt"
>;
export type AdminWeightClass = WeightClassRecord;

export const toPublicLengthClass = (
  lengthClass: LengthClassRecord,
): PublicLengthClass => ({
  id: lengthClass.id,
  name: lengthClass.name,
  unit: lengthClass.unit,
});

export const toPublicLengthClassList = (
  lengthClasses: LengthClassRecord[],
): PublicLengthClass[] => lengthClasses.map(toPublicLengthClass);

export const toAdminLengthClass = (
  lengthClass: LengthClassRecord,
): AdminLengthClass => ({
  id: lengthClass.id,
  name: lengthClass.name,
  unit: lengthClass.unit,
  createdAt: lengthClass.createdAt,
  updatedAt: lengthClass.updatedAt,
});

export const toAdminLengthClassList = (
  lengthClasses: LengthClassRecord[],
): AdminLengthClass[] => lengthClasses.map(toAdminLengthClass);

export const toPublicWeightClass = (
  weightClass: WeightClassRecord,
): PublicWeightClass => ({
  id: weightClass.id,
  name: weightClass.name,
  unit: weightClass.unit,
});

export const toPublicWeightClassList = (
  weightClasses: WeightClassRecord[],
): PublicWeightClass[] => weightClasses.map(toPublicWeightClass);

export const toAdminWeightClass = (
  weightClass: WeightClassRecord,
): AdminWeightClass => ({
  id: weightClass.id,
  name: weightClass.name,
  unit: weightClass.unit,
  createdAt: weightClass.createdAt,
  updatedAt: weightClass.updatedAt,
});

export const toAdminWeightClassList = (
  weightClasses: WeightClassRecord[],
): AdminWeightClass[] => weightClasses.map(toAdminWeightClass);
