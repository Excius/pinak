# Product Color Swatches: Backend and Admin Handoff

## Purpose

Move product color presentation data out of the mobile frontend and into the catalog backend. The mobile and web clients should receive the correct swatch metadata from the API and render it consistently.

## Current Problem

The mobile product screen currently contains a hardcoded color-name-to-hex map in:

`apps/mobile/app/(tabs)/product/[productId].tsx`

The current approach matches color names against a frontend dictionary:

```ts
const COLOR_SWATCHES: Record<string, string> = {
  black: "#151515",
  white: "#F5F1E8",
  nude: "#C98F72",
  pink: "#E58BA3",
  red: "#B83A3A",
  // ...
};
```

This is not scalable because:

- New colors require a mobile app release.
- Similar names can resolve to the wrong color.
- Admin users cannot control the visual representation of a shade.
- Different clients can display the same color differently.
- Image-based, dual-tone, and gradient shades are not supported.
- The backend has no authoritative color presentation metadata.

## Recommended Ownership

The swatch metadata should belong to the existing `OptionValue` entity.

The existing catalog relationship is:

```text
Option
  └── OptionValue
        └── VariantOptionValue
```

This is the correct ownership model because values such as `Red`, `Rose Nude`, `30ml`, and `Large` already belong to product options. Color-specific metadata can be nullable so non-color options do not need swatch data.

Relevant existing files:

- `apps/api/prisma/schema/catalog.prisma`
- `apps/api/src/routes/option/admin.routes.ts`
- `apps/api/src/services/option.service.ts`
- `apps/api/src/controllers/option.controller.ts`
- `apps/web/src/pages/admin/options/OptionList.tsx`

# 1. Database Changes

## Minimum implementation

Add a nullable hex color field to `OptionValue`:

```prisma
model OptionValue {
  id        String @id @default(cuid())
  optionId  String
  value     String
  sortOrder Int    @default(0)

  swatchColorHex String?

  option         Option               @relation(fields: [optionId], references: [id], onDelete: Cascade)
  variantOptions VariantOptionValue[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([optionId, value])
  @@index([optionId])
}
```

Example records:

```text
Red         -> #B83A3A
Rose Nude   -> #C96C7D
Deep Plum   -> #633A58
Clear       -> null
30ml        -> null
```

## Optional future-ready model

If gradients, dual-tone shades, or image swatches are expected soon, use:

```prisma
enum SwatchType {
  NONE
  SOLID
  DUAL_TONE
  IMAGE
}

model OptionValue {
  id        String @id @default(cuid())
  optionId  String
  value     String
  sortOrder Int    @default(0)

  swatchType      SwatchType @default(NONE)
  swatchColorHex  String?
  swatchColorHex2 String?
  swatchImageUrl  String?

  option         Option               @relation(fields: [optionId], references: [id], onDelete: Cascade)
  variantOptions VariantOptionValue[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

The first release can safely use only `swatchColorHex`. The extended model should be used only if the catalog already requires advanced swatch formats.

## Validation

Validate solid colors with:

```regex
^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$
```

Accept:

```text
#C98F72
#C98F7280
```

Reject arbitrary CSS or executable values such as:

```text
red
rgb(255, 0, 0)
javascript:...
```

# 2. Shared Type Changes

Update:

`packages/types/src/api/option.ts`

Public option values should include the new field:

```ts
const PublicOptionValueSchema = z.object({
  id: z.string(),
  value: z.string(),
  sortOrder: z.number().int(),
  swatchColorHex: z.string().nullable().optional(),
});
```

Admin option values should expose the same property:

```ts
const AdminOptionValueSchema = PublicOptionValueSchema.extend({
  optionId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
```

Add the property to the create and update request schemas:

```ts
swatchColorHex: z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/)
  .nullable()
  .optional(),
```

# 3. Option API Changes

The existing option endpoints can be extended; no new resource is required.

## Create option value

```http
POST /options/:optionId/values
```

Request:

```json
{
  "value": "Rose Nude",
  "sortOrder": 2,
  "swatchColorHex": "#C96C7D"
}
```

## Update option value

```http
PUT /options/values/:id
```

Request:

```json
{
  "value": "Rose Nude",
  "sortOrder": 2,
  "swatchColorHex": "#C96C7D"
}
```

## Clear a swatch

```json
{
  "swatchColorHex": null
}
```

## Public options

```http
GET /options
```

Response example:

```json
{
  "success": true,
  "data": [
    {
      "id": "color-option-id",
      "name": "Color",
      "sortOrder": 1,
      "values": [
        {
          "id": "rose-nude-id",
          "value": "Rose Nude",
          "sortOrder": 2,
          "swatchColorHex": "#C96C7D"
        }
      ]
    }
  ]
}
```

Existing API implementation points:

- `apps/api/src/routes/option/admin.routes.ts`
- `apps/api/src/controllers/option.controller.ts`
- `apps/api/src/services/option.service.ts`
- `apps/api/src/repositories/option.repository.ts`
- `apps/api/src/lib/mappers/option.mapper.ts`

The service currently passes option-value payloads through to Prisma, so it should only need updated types and validation unless the repository explicitly selects fields.

# 4. Product Detail API Changes

The product response currently maps variant options to:

```json
{
  "optionName": "Color",
  "valueName": "Rose Nude"
}
```

Update the response to include stable IDs and swatch metadata:

```json
{
  "optionId": "color-option-id",
  "optionValueId": "rose-nude-id",
  "optionName": "Color",
  "valueName": "Rose Nude",
  "swatchColorHex": "#C96C7D"
}
```

Update:

`apps/api/src/lib/mappers/product.mapper.ts`

Recommended mapper shape:

```ts
optionValues: v.optionValues
  ?.map((ov: any) => ({
    optionId: ov.optionValue?.optionId,
    optionValueId: ov.optionValue?.id,
    optionName: ov.optionValue?.option?.name,
    valueName: ov.optionValue?.value,
    swatchColorHex: ov.optionValue?.swatchColorHex ?? null,
  }))
  .filter((ov: any) => ov.optionName && ov.valueName) || [],
```

The Prisma product repository already includes option values and their parent option:

```ts
optionValues: {
  include: {
    optionValue: {
      include: {
        option: true,
      },
    },
  },
}
```

Update the product response schema in:

`packages/types/src/api/product.ts`

```ts
optionValues: z.array(
  z.object({
    optionId: z.string().optional(),
    optionValueId: z.string().optional(),
    optionName: z.string(),
    valueName: z.string(),
    swatchColorHex: z.string().nullable().optional(),
  }),
),
```

# 5. Admin Panel Changes

The existing admin page already manages options and option values:

`apps/web/src/pages/admin/options/OptionList.tsx`

The current option-value form contains:

- Value
- Sort order

Add:

- Swatch color
- Color picker or hex input
- Live swatch preview
- Clear/remove color action

## Recommended admin form

```text
Value:         Rose Nude
Swatch color:  [ #C96C7D ] [color picker]
Preview:       ● Rose Nude
Sort order:    2
```

For non-color values:

```text
Value:         30ml
Swatch color:  Not configured
```

## Admin behavior

The swatch field should be available for every option value but highlighted for options whose name is commonly color-related:

```text
Color
Shade
Finish
Tone
```

Do not make the field mandatory because sizes, materials, and volumes do not need color metadata.

## Admin client types

Update:

`apps/web/src/api/admin/admin.options.api.ts`

```ts
export interface AdminOptionValue {
  id: string;
  optionId?: string;
  value: string;
  sortOrder: number;
  swatchColorHex?: string | null;
}
```

Update create and update payloads:

```ts
{
  value: string
  sortOrder?: number
  swatchColorHex?: string | null
}
```

## Admin validation UX

The admin interface should:

- Validate the hex format before submission.
- Show a live preview circle or pill.
- Allow clearing the swatch.
- Display an error for invalid values.
- Preserve the existing value when no color change is made.
- Allow `null` for non-color option values.

# 6. Mobile Changes

The mobile product screen currently owns the hardcoded color dictionary in:

`apps/mobile/app/(tabs)/product/[productId].tsx`

Remove:

```ts
const COLOR_SWATCHES = { ... };
```

Remove:

```ts
function getColorSwatch(value: string) { ... }
```

Use API data instead:

```ts
const colorValues = product.variants.flatMap((variant) =>
  variant.optionValues
    .filter((option) => /color|shade/i.test(option.optionName))
    .map((option) => ({
      value: option.valueName,
      swatchColorHex: option.swatchColorHex,
      optionValueId: option.optionValueId,
    })),
);
```

Render the backend color directly:

```tsx
<View
  style={{
    backgroundColor: color.swatchColorHex || "#8B8B8B",
  }}
/>
```

The fallback should only support legacy records that have not yet been migrated. It should not be a frontend color-name dictionary.

## Variant selection

Use `optionValueId` whenever possible:

```text
User taps Rose Nude
        ↓
Find active variant containing that optionValueId
        ↓
Set selectedVariantId
        ↓
Update image, price, weight, availability, and cart target
```

Comparing display names should only be a temporary compatibility fallback.

# 7. FilterValue Consideration

`OptionValue` is the correct source for product-detail swatches because color belongs to a specific variant.

Example:

```text
Variant A -> Color: Rose Nude
Variant B -> Color: Plum
```

`FilterValue` is used for catalog filtering and may also contain color names, but it is not necessarily tied to one variant.

If catalog filter chips also need colored swatches, add the same nullable field to `FilterValue`:

```prisma
swatchColorHex String?
```

That should be treated as a separate follow-up unless the filter UI specifically needs colored filter chips now.

# 8. Migration Plan

## Phase 1: Database

1. Add nullable `swatchColorHex` to `OptionValue`.
2. Run a Prisma migration.
3. Regenerate the Prisma client.
4. Verify existing option values remain valid.

Example migration name:

```bash
npx prisma migrate dev --name add_option_value_swatch_color
```

## Phase 2: API contracts

1. Update `packages/types/src/api/option.ts`.
2. Update `packages/types/src/api/product.ts`.
3. Update option create/update validation.
4. Update option mappers.
5. Update the product variant mapper.
6. Rebuild `@repo/types`.

## Phase 3: Admin panel

1. Add the color input to the option-value modal.
2. Add a live color preview.
3. Add validation and clear behavior.
4. Update admin API client types.
5. Populate existing color values.

## Phase 4: Data backfill

A one-time migration can initially populate common values:

```ts
const initialSwatches = {
  Black: "#151515",
  White: "#F5F1E8",
  Ivory: "#FFF5D6",
  Beige: "#D8B08C",
  Nude: "#C98F72",
  Brown: "#6B3F2A",
  Bronze: "#A9683B",
  Gold: "#C9A962",
  Silver: "#BFC5C9",
  Red: "#B83A3A",
  Pink: "#E58BA3",
  Rose: "#C96C7D",
  Coral: "#F27C68",
  Orange: "#E87832",
  Peach: "#F2A07E",
  Yellow: "#E5C84A",
  Green: "#5D8B63",
  Teal: "#3C9C95",
  Blue: "#4E78B5",
  Purple: "#805A9C",
  Mauve: "#9B7180",
  Plum: "#633A58",
};
```

This map should be used only by the migration script. It must not remain in the mobile application.

Ambiguous values should be left null for manual admin review.

## Phase 5: Mobile cleanup

1. Remove the frontend color dictionary.
2. Remove name-based color matching.
3. Read `swatchColorHex` from API data.
4. Use `optionValueId` for variant selection.
5. Keep only a neutral fallback for legacy records.
6. Remove the fallback after all production color values are populated.

# 9. Acceptance Criteria

The implementation is complete when:

- Admin can create a Color option value with a swatch color.
- Admin can edit the swatch color later.
- Admin can clear the swatch color.
- Invalid hex colors are rejected.
- `GET /options` returns `swatchColorHex`.
- `GET /products/:id` returns `swatchColorHex` inside variant option values.
- Product responses include stable option and option-value IDs.
- Mobile no longer contains a color-name-to-hex dictionary.
- Mobile displays the backend-provided color.
- Tapping a swatch selects the correct active variant.
- The selected variant updates image, price, weight, availability, and cart behavior.
- Non-color options do not require swatch data.
- Existing products without swatch metadata do not crash the app.
- Admin provides a visible preview before saving.
- Web and mobile clients can render the same swatch metadata.

# 10. Recommended First Implementation

Use the minimum model first:

```text
OptionValue.swatchColorHex
```

Extend the existing option CRUD and admin page, return the value through product variant option data, and remove the mobile color dictionary after backfilling existing colors.

Do not create a separate color table unless the business requires color-specific catalog management, aliases, localization, or complex color assets later.
