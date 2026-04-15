export type TaxClassRecord = {
  id: string;
  name: string;
  rate: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicTaxClass = Omit<TaxClassRecord, "createdAt" | "updatedAt">;

export type AdminTaxClass = TaxClassRecord;

export const toPublicTaxClass = (taxClass: TaxClassRecord): PublicTaxClass => ({
  id: taxClass.id,
  name: taxClass.name,
  rate: taxClass.rate,
});

export const toPublicTaxClassList = (
  taxClasses: TaxClassRecord[],
): PublicTaxClass[] => taxClasses.map(toPublicTaxClass);

export const toAdminTaxClass = (taxClass: TaxClassRecord): AdminTaxClass => ({
  id: taxClass.id,
  name: taxClass.name,
  rate: taxClass.rate,
  createdAt: taxClass.createdAt,
  updatedAt: taxClass.updatedAt,
});

export const toAdminTaxClassList = (
  taxClasses: TaxClassRecord[],
): AdminTaxClass[] => taxClasses.map(toAdminTaxClass);
