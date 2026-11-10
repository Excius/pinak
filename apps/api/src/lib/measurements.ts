/**
 * Physical measurements of a variant (weight, length/width/height).
 *
 * Each value is resolved in this order, per group (weight / dimensions):
 *   1. the variant's own value (an override),
 *   2. the first of the variant's option values that defines one (e.g. Size "50ml"),
 *      ordered by option sort order,
 *   3. the product's value (legacy fallback).
 */

type MeasurementSource = {
  weightGrams?: number | null;
  weightClassId?: string | null;
  dimensionLength?: number | null;
  dimensionWidth?: number | null;
  dimensionHeight?: number | null;
  lengthClassId?: string | null;
};

export type ResolvedMeasurements = {
  weight: {
    grams: number;
    weightClassId: string | null;
    source: string;
  } | null;
  dimensions: {
    length: number | null;
    width: number | null;
    height: number | null;
    lengthClassId: string | null;
    source: string;
  } | null;
};

const hasWeight = (m?: MeasurementSource | null) => m?.weightGrams != null;
const hasDimensions = (m?: MeasurementSource | null) =>
  m?.dimensionLength != null ||
  m?.dimensionWidth != null ||
  m?.dimensionHeight != null;

export function resolveVariantMeasurements(
  variant: (MeasurementSource & { optionValues?: any[] }) | null | undefined,
  product?: MeasurementSource | null,
): ResolvedMeasurements {
  if (!variant) return { weight: null, dimensions: null };

  // Option values as { source label, measurements }, ordered by their option's sort order
  const fromOptions = (variant.optionValues ?? [])
    .map((row: any) => row?.optionValue ?? row)
    .filter(Boolean)
    .sort(
      (a: any, b: any) =>
        (a.option?.sortOrder ?? 0) - (b.option?.sortOrder ?? 0),
    )
    .map((ov: any) => ({
      label: `option ${ov.option?.name ?? ""} ${ov.value ?? ov.valueName ?? ""}`
        .replace(/\s+/g, " ")
        .trim(),
      m: ov as MeasurementSource,
    }));

  const sources: { label: string; m: MeasurementSource | null | undefined }[] =
    [
      { label: "variant", m: variant },
      ...fromOptions,
      { label: "product", m: product },
    ];

  const w = sources.find((s) => hasWeight(s.m));
  const d = sources.find((s) => hasDimensions(s.m));

  return {
    weight: w
      ? {
          grams: w.m!.weightGrams as number,
          weightClassId: w.m!.weightClassId ?? null,
          source: w.label,
        }
      : null,
    dimensions: d
      ? {
          length: d.m!.dimensionLength ?? null,
          width: d.m!.dimensionWidth ?? null,
          height: d.m!.dimensionHeight ?? null,
          lengthClassId: d.m!.lengthClassId ?? null,
          source: d.label,
        }
      : null,
  };
}
