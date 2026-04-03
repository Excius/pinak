# Seed Data Overview

This document describes the comprehensive test data seeded by `prisma/seed.ts`.

## Data Summary

### 1. Lookup Tables
- **Brands**: 5 brands (GlowBeauty, LipLux, LashQueen, EyeGlow, SkinCare Plus)
- **Tax Classes**: 5 GST rates (5%, 12%, 18%, 28%, Zero Rated)
- **Length Classes**: 3 units (Centimeter, Inch, Millimeter)
- **Weight Classes**: 4 units (Gram, Kilogram, Pound, Ounce)

### 2. Options & Values
- **Size**: 10 values (30ml, 35ml, 50ml, 100ml, 200ml, 4g, 8ml, 10ml, 12g, 15g)
- **Shade**: 20+ values covering various skin tones and makeup colors

### 3. Categories (2-Level Hierarchy)
- **Makeup** (parent)
  - Foundation
  - Lipstick
  - Mascara
  - Eyeshadow
- **Skincare** (parent)
  - Moisturizers
  - Serums

### 4. Filter Groups
- **Color**: 16 shade values
- **Finish**: 5 types (Matte, Satin, Shimmer, Dewy, Glossy)
- **Skin Type**: 5 types (Oily, Dry, Combination, Normal, Sensitive)

### 5. Products
10 products spanning across categories:
- Foundation products (Radiant Glow, Liquid Glow)
- Lipsticks (Velvet Matte, Satin)
- Mascaras (Volume Boost, Waterproof)
- Eyeshadow palettes (Shimmer, Matte)
- Skincare (Hydrating Moisturizer, Vitamin C Serum)

Each product includes:
- Multiple variants (different shades/sizes)
- Product images
- Filter associations
- Option values
- Proper category and brand linkage

### 6. Related Products
Cross-product relationships for "You May Also Like" features

### 7. Featured Sections (NEW - Enhanced)
5 featured sections with distinct purposes:
- **Homepage Hero Banner** (priority 100) - 2 hero products
- **Beauty Expert Picks** (priority 90) - 4 curated products
- **Limited Time Deals** (priority 80) - 3 promotional items
- **Customer Favorites** (priority 70) - 4 bestselling products
- **New This Week** (priority 60) - 3 new arrivals

Total: 16 featured product associations

### 8. Users
Multiple user roles for testing auth flows:
- 1 Admin user
- 1 Moderator user
- Regular users

All use dummy hashed passwords for dev/testing

### 9. Combo Kits
Pre-configured product bundles with discounted pricing

### 10. Shopping Carts
Sample cart data with both individual products and combo items

### 11. Coupons
3 promotional coupons with different discount types:
- WELCOME10
- FLAT200
- SKINCARE15

### 12. Orders
3 sample orders with different statuses:
- DELIVERED
- PROCESSING
- SHIPPED

### 13. Reviews
6 product reviews with ratings and comments

### 14. Articles
3 blog/content articles

### 15. Stores
3 store locations

### 16. Quiz System
3 quiz questions with options and product recommendation rules

### 17. Metrics Backfill
Automatically calculates and updates `purchasedCount` for products and combo kits based on seeded orders

## Running the Seed

```bash
cd apps/api
npm run prisma:seed
```

**Note**: The seed script performs cleanup before seeding, so it's safe to run multiple times. All existing data will be deleted and recreated.

## Featured Sections Priority

Priority determines the display order (higher = shown first):
- Homepage Hero (100) - Most prominent
- Expert Picks (90)
- Deals (80)
- Bestsellers (70)
- New Arrivals (60)

## Featured Section Types

- **HOMEPAGE_HERO**: Main banner/carousel products
- **EXPERT_PICKS**: Curated selections by beauty experts
- **DEALS**: Time-limited promotional items
