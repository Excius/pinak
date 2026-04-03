import { prisma } from "../src/lib/prisma.js";
import { normalizeEmail } from "../src/lib/email.js";

// ---------------------------------------------------------------------------
// Cleanup — strict reverse-dependency order so FK constraints are satisfied
// ---------------------------------------------------------------------------
async function cleanup() {
  console.log("🧹 Cleaning up existing data...");

  // Order-dependent pivot tables first
  await prisma.couponUsage.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();

  await prisma.review.deleteMany();
  await prisma.auditLog.deleteMany();

  // Featured
  await prisma.featuredProduct.deleteMany();
  await prisma.featuredSection.deleteMany();

  // Product-related (images, combo kits, variants, products)
  await prisma.productImage.deleteMany();
  await prisma.comboKitItem.deleteMany();
  await prisma.comboKit.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  // Supporting structures
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Content / misc
  await prisma.article.deleteMany();
  await prisma.store.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizRule.deleteMany();
  await prisma.quizQuestion.deleteMany();

  // Lookup tables (clean so re-seeding always starts fresh)
  await prisma.filterValue.deleteMany();
  await prisma.filterGroup.deleteMany();
  await prisma.optionValue.deleteMany();
  await prisma.option.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.taxClass.deleteMany();
  await prisma.lengthClass.deleteMany();
  await prisma.weightClass.deleteMany();

  console.log("✅ Cleanup completed");
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data first
  await cleanup();

  // -------------------------------------------------------------------------
  // 1. Lookup tables (cleanup already ran, so use create not upsert)
  // -------------------------------------------------------------------------
  const brandMap: Record<string, { id: string }> = {};
  for (const bName of [
    "GlowBeauty",
    "LipLux",
    "LashQueen",
    "EyeGlow",
    "SkinCare Plus",
  ]) {
    const slug = bName.toLowerCase().replace(/\s+/g, "-");
    const b = await prisma.brand.create({ data: { name: bName, slug } });
    brandMap[bName] = b;
  }

  const taxClassMap: Record<string, { id: string }> = {};
  for (const tc of [
    { name: "GST 5%", rate: 5.0 },
    { name: "GST 12%", rate: 12.0 },
    { name: "GST 18%", rate: 18.0 },
    { name: "GST 28%", rate: 28.0 },
    { name: "Zero Rated", rate: 0.0 },
  ]) {
    taxClassMap[tc.name] = await prisma.taxClass.create({ data: tc });
  }

  const lengthClassMap: Record<string, { id: string }> = {};
  for (const lc of [
    { name: "Centimeter", unit: "cm" },
    { name: "Inch", unit: "in" },
    { name: "Millimeter", unit: "mm" },
  ]) {
    lengthClassMap[lc.name] = await prisma.lengthClass.create({ data: lc });
  }

  const weightClassMap: Record<string, { id: string }> = {};
  for (const wc of [
    { name: "Gram", unit: "g" },
    { name: "Kilogram", unit: "kg" },
    { name: "Pound", unit: "lb" },
    { name: "Ounce", unit: "oz" },
  ]) {
    weightClassMap[wc.name] = await prisma.weightClass.create({ data: wc });
  }

  console.log("✅ Created lookup tables");

  // -------------------------------------------------------------------------
  // 2. Options + OptionValues
  // -------------------------------------------------------------------------
  const optionSize = await prisma.option.create({ data: { name: "Size" } });
  const optionShade = await prisma.option.create({ data: { name: "Shade" } });

  const sizeValues = [
    "30ml",
    "35ml",
    "50ml",
    "100ml",
    "200ml",
    "4g",
    "8ml",
    "10ml",
    "12g",
    "15g",
  ];
  const shadeValues = [
    "Light Beige",
    "Medium Beige",
    "Deep Beige",
    "Ruby Red",
    "Nude Pink",
    "Deep Plum",
    "Black",
    "Brown",
    "Porcelain",
    "Ivory",
    "Sand",
    "Coral",
    "Rose",
    "Berry",
    "Jet Black",
    "Deep Brown",
    // Palette-specific shades (were missing previously)
    "Warm Tones",
    "Cool Tones",
    "Neutral",
    "Smoky",
  ];

  const optionValueMap: Record<string, Record<string, { id: string }>> = {
    Size: {},
    Shade: {},
  };

  for (const v of sizeValues) {
    optionValueMap.Size[v] = await prisma.optionValue.create({
      data: { optionId: optionSize.id, value: v },
    });
  }
  for (const v of shadeValues) {
    optionValueMap.Shade[v] = await prisma.optionValue.create({
      data: { optionId: optionShade.id, value: v },
    });
  }

  console.log("✅ Created options & option values");

  // -------------------------------------------------------------------------
  // 3. Categories — 2-level hierarchy
  // -------------------------------------------------------------------------
  const catMakeup = await prisma.category.create({
    data: { name: "Makeup", slug: "makeup" },
  });
  const catSkincareParent = await prisma.category.create({
    data: { name: "Skincare", slug: "skincare" },
  });
  const catFoundation = await prisma.category.create({
    data: { name: "Foundation", slug: "foundation", parentId: catMakeup.id },
  });
  // Add a grandchild for testing: Makeup -> Foundation -> Liquid Foundation
  const catLiquidFoundation = await prisma.category.create({
    data: {
      name: "Liquid Foundation",
      slug: "liquid-foundation",
      parentId: catFoundation.id,
    },
  });
  const catLipstick = await prisma.category.create({
    data: { name: "Lipstick", slug: "lipstick", parentId: catMakeup.id },
  });
  const catMascara = await prisma.category.create({
    data: { name: "Mascara", slug: "mascara", parentId: catMakeup.id },
  });
  const catEyeshadow = await prisma.category.create({
    data: { name: "Eyeshadow", slug: "eyeshadow", parentId: catMakeup.id },
  });
  const catMoisturizers = await prisma.category.create({
    data: {
      name: "Moisturizers",
      slug: "moisturizers",
      parentId: catSkincareParent.id,
    },
  });
  const catSerums = await prisma.category.create({
    data: { name: "Serums", slug: "serums", parentId: catSkincareParent.id },
  });

  console.log(
    "✅ Created categories (2-level hierarchy: Makeup → Foundation/Lipstick/Mascara/Eyeshadow, Skincare → Moisturizers/Serums)",
  );

  // -------------------------------------------------------------------------
  // Category images (primary + secondary) — helpful for testing image APIs
  // -------------------------------------------------------------------------
  try {
    await prisma.categoryImage.create({
      data: {
        categoryId: catMakeup.id,
        url: "https://example.com/images/categories/makeup-primary.jpg",
        altText: "Makeup — primary image",
        isPrimary: true,
        sortOrder: 0,
      },
    });

    await prisma.categoryImage.create({
      data: {
        categoryId: catMakeup.id,
        url: "https://example.com/images/categories/makeup-secondary.jpg",
        altText: "Makeup — secondary image",
        isPrimary: false,
        sortOrder: 1,
      },
    });

    await prisma.categoryImage.create({
      data: {
        categoryId: catSkincareParent.id,
        url: "https://example.com/images/categories/skincare-primary.jpg",
        altText: "Skincare — primary image",
        isPrimary: true,
        sortOrder: 0,
      },
    });

    await prisma.categoryImage.create({
      data: {
        categoryId: catSkincareParent.id,
        url: "https://example.com/images/categories/skincare-secondary.jpg",
        altText: "Skincare — secondary image",
        isPrimary: false,
        sortOrder: 1,
      },
    });

    console.log("✅ Created category images (primary + secondary)");
  } catch (err: any) {
    // If the CategoryImage table/migration isn't present, skip without failing the whole seed.
    console.warn(
      "⚠️  Skipping seeding category images (CategoryImage table may be missing):",
      err?.message ?? err,
    );
  }

  // Seed filter groups and values used for faceted search (Color, Finish, Skin Type)
  const filterGroupsData = [
    {
      name: "Color",
      slug: "color",
      values: [
        "Light Beige",
        "Medium Beige",
        "Deep Beige",
        "Ruby Red",
        "Nude Pink",
        "Deep Plum",
        "Black",
        "Brown",
        "Porcelain",
        "Ivory",
        "Sand",
        "Coral",
        "Rose",
        "Berry",
        "Jet Black",
        "Deep Brown",
      ],
    },
    {
      name: "Finish",
      slug: "finish",
      values: ["Matte", "Satin", "Shimmer", "Dewy", "Glossy"],
    },
    {
      name: "Skin Type",
      slug: "skin-type",
      values: ["Oily", "Dry", "Combination", "Normal", "Sensitive"],
    },
  ];

  // -------------------------------------------------------------------------
  // 4. Filter groups & values
  // -------------------------------------------------------------------------
  const filterValueMap: Record<string, Record<string, { id: string }>> = {};

  for (const fg of filterGroupsData) {
    const group = await prisma.filterGroup.create({
      data: { name: fg.name, slug: fg.slug, sortOrder: 0, isActive: true },
    });

    filterValueMap[fg.slug] = {};
    for (const v of fg.values) {
      const vSlug = v
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const fv = await prisma.filterValue.create({
        data: { filterGroupId: group.id, name: v, slug: vSlug },
      });
      filterValueMap[fg.slug][vSlug] = fv;
    }
  }

  console.log("✅ Created filter groups & values");

  // Helper to resolve a filter value id by slug across all groups
  function fv(slug: string): string {
    for (const group of Object.values(filterValueMap)) {
      if (group[slug]) return group[slug].id;
    }
    console.warn(`⚠️  FilterValue slug '${slug}' not found`);
    return "";
  }

  // Shared IDs for product creation
  const gst12Id = taxClassMap["GST 12%"].id;
  const gst18Id = taxClassMap["GST 18%"].id;
  const gramId = weightClassMap["Gram"].id;
  const mmId = lengthClassMap["Millimeter"].id;

  // -------------------------------------------------------------------------
  // 5. Products with variants, images, option values, filter values
  // -------------------------------------------------------------------------
  type ProductDef = {
    productData: {
      name: string;
      slug: string;
      description: string;
      brandId: string;
      categoryId: string;
      taxClassId: string;
      weightClassId: string;
      lengthClassId: string;
      weightGrams: number;
    };
    variants: Array<{
      sku: string;
      shade: string | null;
      size: string;
      price: number;
      stock: number;
      tags: string[];
    }>;
    filterSlugs: string[];
  };

  const productDefs: ProductDef[] = [
    {
      productData: {
        name: "Radiant Glow Foundation",
        slug: "radiant-glow-foundation",
        description: "A lightweight foundation that provides natural coverage",
        brandId: brandMap["GlowBeauty"].id,
        categoryId: catFoundation.id,
        taxClassId: gst12Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 30,
      },
      variants: [
        {
          sku: "RGF-001",
          shade: "Light Beige",
          size: "30ml",
          price: 4500,
          stock: 25,
          tags: ["matte", "foundation", "light"],
        },
        {
          sku: "RGF-002",
          shade: "Medium Beige",
          size: "30ml",
          price: 4500,
          stock: 30,
          tags: ["matte", "foundation", "medium"],
        },
        {
          sku: "RGF-003",
          shade: "Deep Beige",
          size: "30ml",
          price: 4500,
          stock: 20,
          tags: ["matte", "foundation", "deep"],
        },
      ],
      filterSlugs: ["light-beige", "medium-beige", "deep-beige", "matte"],
    },
    {
      productData: {
        name: "Velvet Matte Lipstick",
        slug: "velvet-matte-lipstick",
        description: "Long-lasting matte lipstick with intense color payoff",
        brandId: brandMap["LipLux"].id,
        categoryId: catLipstick.id,
        taxClassId: gst12Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 4,
      },
      variants: [
        {
          sku: "VML-001",
          shade: "Ruby Red",
          size: "4g",
          price: 2800,
          stock: 40,
          tags: ["matte", "lipstick", "red"],
        },
        {
          sku: "VML-002",
          shade: "Nude Pink",
          size: "4g",
          price: 2800,
          stock: 35,
          tags: ["matte", "lipstick", "nude"],
        },
        {
          sku: "VML-003",
          shade: "Deep Plum",
          size: "4g",
          price: 2800,
          stock: 28,
          tags: ["matte", "lipstick", "plum"],
        },
      ],
      filterSlugs: ["ruby-red", "nude-pink", "deep-plum", "matte"],
    },
    {
      productData: {
        name: "Volume Boost Mascara",
        slug: "volume-boost-mascara",
        description: "Dramatic volume and length for your lashes",
        brandId: brandMap["LashQueen"].id,
        categoryId: catMascara.id,
        taxClassId: gst12Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 10,
      },
      variants: [
        {
          sku: "VBM-001",
          shade: "Black",
          size: "10ml",
          price: 2200,
          stock: 50,
          tags: ["mascara", "volume", "black"],
        },
        {
          sku: "VBM-002",
          shade: "Brown",
          size: "10ml",
          price: 2200,
          stock: 45,
          tags: ["mascara", "volume", "brown"],
        },
      ],
      filterSlugs: ["black", "brown"],
    },
    {
      productData: {
        name: "Shimmer Eyeshadow Palette",
        slug: "shimmer-eyeshadow-palette",
        description: "12 shades of shimmering eyeshadows for versatile looks",
        brandId: brandMap["EyeGlow"].id,
        categoryId: catEyeshadow.id,
        taxClassId: gst12Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 12,
      },
      variants: [
        {
          sku: "SEP-001",
          shade: "Warm Tones",
          size: "12g",
          price: 3800,
          stock: 15,
          tags: ["eyeshadow", "shimmer", "warm"],
        },
        {
          sku: "SEP-002",
          shade: "Cool Tones",
          size: "12g",
          price: 3800,
          stock: 18,
          tags: ["eyeshadow", "shimmer", "cool"],
        },
      ],
      filterSlugs: ["shimmer"],
    },
    {
      productData: {
        name: "Hydrating Face Moisturizer",
        slug: "hydrating-face-moisturizer",
        description: "Deep hydration for all skin types",
        brandId: brandMap["SkinCare Plus"].id,
        categoryId: catMoisturizers.id,
        taxClassId: gst18Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 50,
      },
      variants: [
        {
          sku: "HFM-001",
          shade: null,
          size: "50ml",
          price: 3200,
          stock: 60,
          tags: ["moisturizer", "skincare", "hydration"],
        },
        {
          sku: "HFM-002",
          shade: null,
          size: "100ml",
          price: 5200,
          stock: 40,
          tags: ["moisturizer", "skincare", "hydration"],
        },
      ],
      filterSlugs: ["dry", "normal", "dewy"],
    },
    {
      productData: {
        name: "Liquid Glow Foundation",
        slug: "liquid-glow-foundation",
        description: "Buildable coverage with a natural glow finish",
        brandId: brandMap["GlowBeauty"].id,
        categoryId: catFoundation.id,
        taxClassId: gst12Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 35,
      },
      variants: [
        {
          sku: "LGF-001",
          shade: "Porcelain",
          size: "35ml",
          price: 4800,
          stock: 22,
          tags: ["foundation", "glow", "porcelain"],
        },
        {
          sku: "LGF-002",
          shade: "Ivory",
          size: "35ml",
          price: 4800,
          stock: 28,
          tags: ["foundation", "glow", "ivory"],
        },
        {
          sku: "LGF-003",
          shade: "Sand",
          size: "35ml",
          price: 4800,
          stock: 19,
          tags: ["foundation", "glow", "sand"],
        },
      ],
      filterSlugs: ["porcelain", "ivory", "sand", "dewy"],
    },
    {
      productData: {
        name: "Satin Lipstick",
        slug: "satin-lipstick",
        description: "Creamy satin finish lipstick that feels luxurious",
        brandId: brandMap["LipLux"].id,
        categoryId: catLipstick.id,
        taxClassId: gst12Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 4,
      },
      variants: [
        {
          sku: "SL-001",
          shade: "Coral",
          size: "4g",
          price: 2600,
          stock: 32,
          tags: ["lipstick", "satin", "coral"],
        },
        {
          sku: "SL-002",
          shade: "Rose",
          size: "4g",
          price: 2600,
          stock: 29,
          tags: ["lipstick", "satin", "rose"],
        },
        {
          sku: "SL-003",
          shade: "Berry",
          size: "4g",
          price: 2600,
          stock: 24,
          tags: ["lipstick", "satin", "berry"],
        },
      ],
      filterSlugs: ["coral", "rose", "berry", "satin"],
    },
    {
      productData: {
        name: "Waterproof Mascara",
        slug: "waterproof-mascara",
        description: "Smudge-proof, waterproof formula for all-day wear",
        brandId: brandMap["LashQueen"].id,
        categoryId: catMascara.id,
        taxClassId: gst12Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 8,
      },
      variants: [
        {
          sku: "WM-001",
          shade: "Jet Black",
          size: "8ml",
          price: 2500,
          stock: 38,
          tags: ["mascara", "waterproof", "black"],
        },
        {
          sku: "WM-002",
          shade: "Deep Brown",
          size: "8ml",
          price: 2500,
          stock: 42,
          tags: ["mascara", "waterproof", "brown"],
        },
      ],
      filterSlugs: ["jet-black", "deep-brown"],
    },
    {
      productData: {
        name: "Matte Eyeshadow Palette",
        slug: "matte-eyeshadow-palette",
        description: "Highly pigmented matte shades for professional looks",
        brandId: brandMap["EyeGlow"].id,
        categoryId: catEyeshadow.id,
        taxClassId: gst12Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 15,
      },
      variants: [
        {
          sku: "MEP-001",
          shade: "Neutral",
          size: "15g",
          price: 4200,
          stock: 12,
          tags: ["eyeshadow", "matte", "neutral"],
        },
        {
          sku: "MEP-002",
          shade: "Smoky",
          size: "15g",
          price: 4200,
          stock: 16,
          tags: ["eyeshadow", "matte", "smoky"],
        },
      ],
      filterSlugs: ["matte"],
    },
    {
      productData: {
        name: "Vitamin C Serum",
        slug: "vitamin-c-serum",
        description: "Brightening serum with 20% Vitamin C for radiant skin",
        brandId: brandMap["SkinCare Plus"].id,
        categoryId: catSerums.id,
        taxClassId: gst18Id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 30,
      },
      variants: [
        {
          sku: "VCS-001",
          shade: null,
          size: "30ml",
          price: 5800,
          stock: 25,
          tags: ["serum", "skincare", "vitamin-c"],
        },
        {
          sku: "VCS-002",
          shade: null,
          size: "50ml",
          price: 8500,
          stock: 15,
          tags: ["serum", "skincare", "vitamin-c"],
        },
      ],
      filterSlugs: ["oily", "combination", "sensitive"],
    },
  ];

  const createdProducts: Array<{ id: string; slug: string }> = [];
  const createdVariants: Array<{ id: string; sku: string; price: number }> = [];

  for (const { productData, variants, filterSlugs } of productDefs) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        brandId: productData.brandId,
        taxClassId: productData.taxClassId,
        weightClassId: productData.weightClassId,
        lengthClassId: productData.lengthClassId,
        weightGrams: productData.weightGrams,
        categories: { create: [{ categoryId: productData.categoryId }] },
      },
    });
    createdProducts.push({ id: product.id, slug: product.slug });

    for (const variant of variants) {
      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          tags: variant.tags,
        },
      });
      createdVariants.push({
        id: createdVariant.id,
        sku: variant.sku,
        price: variant.price,
      });

      if (variant.size) {
        const ov = optionValueMap.Size[variant.size];
        if (ov)
          await prisma.variantOptionValue.create({
            data: { variantId: createdVariant.id, optionValueId: ov.id },
          });
        else console.warn(`⚠️  Missing OptionValue Size='${variant.size}'`);
      }
      if (variant.shade) {
        const ov = optionValueMap.Shade[variant.shade];
        if (ov)
          await prisma.variantOptionValue.create({
            data: { variantId: createdVariant.id, optionValueId: ov.id },
          });
        else console.warn(`⚠️  Missing OptionValue Shade='${variant.shade}'`);
      }

      await prisma.productImage.create({
        data: {
          productVariantId: createdVariant.id,
          url: `https://example.com/images/${productData.slug}-${variant.sku.toLowerCase()}.jpg`,
          altText: `${productData.name} — ${variant.shade ?? variant.size}`,
          isPrimary: true,
        },
      });
    }

    // Attach filter values for this product
    const pfData = filterSlugs
      .map((slug) => fv(slug))
      .filter(Boolean)
      .map((filterValueId) => ({ productId: product.id, filterValueId }));
    if (pfData.length) {
      await prisma.productFilterValue.createMany({
        data: pfData,
        skipDuplicates: true,
      });
    }
  }

  const slugToId = Object.fromEntries(
    createdProducts.map((p) => [p.slug, p.id]),
  );
  const skuToVariant = Object.fromEntries(
    createdVariants.map((v) => [v.sku, v]),
  );

  console.log(
    `✅ Created ${productDefs.length} products with variants, images & filter values`,
  );

  // -------------------------------------------------------------------------
  // 6. Related products
  // -------------------------------------------------------------------------
  const relatedPairs = [
    {
      product: "radiant-glow-foundation",
      related: "liquid-glow-foundation",
      sortOrder: 1,
    },
    {
      product: "radiant-glow-foundation",
      related: "hydrating-face-moisturizer",
      sortOrder: 2,
    },
    {
      product: "velvet-matte-lipstick",
      related: "satin-lipstick",
      sortOrder: 1,
    },
    {
      product: "volume-boost-mascara",
      related: "waterproof-mascara",
      sortOrder: 1,
    },
    {
      product: "hydrating-face-moisturizer",
      related: "vitamin-c-serum",
      sortOrder: 1,
    },
    {
      product: "shimmer-eyeshadow-palette",
      related: "matte-eyeshadow-palette",
      sortOrder: 1,
    },
  ];

  const relatedData = relatedPairs
    .filter((r) => slugToId[r.product] && slugToId[r.related])
    .map((r) => ({
      productId: slugToId[r.product],
      relatedProductId: slugToId[r.related],
      sortOrder: r.sortOrder,
    }));

  if (relatedData.length) {
    await prisma.relatedProduct.createMany({
      data: relatedData,
      skipDuplicates: true,
    });
  }
  console.log(`✅ Created ${relatedData.length} related product links`);

  // -------------------------------------------------------------------------
  // 7. Featured sections & products
  // -------------------------------------------------------------------------
  const [
    sectionHero,
    sectionExpertPicks,
    sectionDeals,
    sectionBestsellers,
    sectionNewArrivals,
  ] = await Promise.all([
    prisma.featuredSection.create({
      data: {
        title: "Homepage Hero Banner",
        type: "HOMEPAGE_HERO",
        priority: 100,
      },
    }),
    prisma.featuredSection.create({
      data: {
        title: "Beauty Expert Picks",
        type: "EXPERT_PICKS",
        priority: 90,
      },
    }),
    prisma.featuredSection.create({
      data: { title: "Limited Time Deals", type: "DEALS", priority: 80 },
    }),
    prisma.featuredSection.create({
      data: { title: "Customer Favorites", type: "EXPERT_PICKS", priority: 70 },
    }),
    prisma.featuredSection.create({
      data: { title: "New This Week", type: "DEALS", priority: 60 },
    }),
  ]);

  const featuredEntries = [
    // Homepage Hero - showcase top 2 premium products
    {
      sectionId: sectionHero.id,
      productId: slugToId["radiant-glow-foundation"],
    },
    { sectionId: sectionHero.id, productId: slugToId["vitamin-c-serum"] },

    // Expert Picks - curated selection of high-quality items
    {
      sectionId: sectionExpertPicks.id,
      productId: slugToId["volume-boost-mascara"],
    },
    {
      sectionId: sectionExpertPicks.id,
      productId: slugToId["shimmer-eyeshadow-palette"],
    },
    {
      sectionId: sectionExpertPicks.id,
      productId: slugToId["hydrating-face-moisturizer"],
    },
    {
      sectionId: sectionExpertPicks.id,
      productId: slugToId["velvet-matte-lipstick"],
    },

    // Deals - promotional items at special prices
    {
      sectionId: sectionDeals.id,
      productId: slugToId["liquid-glow-foundation"],
    },
    { sectionId: sectionDeals.id, productId: slugToId["satin-lipstick"] },
    { sectionId: sectionDeals.id, productId: slugToId["waterproof-mascara"] },

    // Bestsellers - most popular products
    {
      sectionId: sectionBestsellers.id,
      productId: slugToId["radiant-glow-foundation"],
    },
    {
      sectionId: sectionBestsellers.id,
      productId: slugToId["volume-boost-mascara"],
    },
    {
      sectionId: sectionBestsellers.id,
      productId: slugToId["velvet-matte-lipstick"],
    },
    {
      sectionId: sectionBestsellers.id,
      productId: slugToId["hydrating-face-moisturizer"],
    },

    // New Arrivals - latest additions
    {
      sectionId: sectionNewArrivals.id,
      productId: slugToId["matte-eyeshadow-palette"],
    },
    {
      sectionId: sectionNewArrivals.id,
      productId: slugToId["waterproof-mascara"],
    },
    {
      sectionId: sectionNewArrivals.id,
      productId: slugToId["vitamin-c-serum"],
    },
  ].filter((e) => e.productId);

  await prisma.featuredProduct.createMany({ data: featuredEntries });
  console.log(
    `✅ Created 5 featured sections + ${featuredEntries.length} featured products`,
  );

  // -------------------------------------------------------------------------
  // 8. Users (admin + moderator + regular)
  // -------------------------------------------------------------------------
  const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$dummy_hash_for_testing";

  const usersData = [
    {
      email: "admin@pinak.com",
      username: "admin",
      name: "Admin User",
      role: "ADMIN" as const,
      isEmailVerified: true,
    },
    {
      email: "moderator@pinak.com",
      username: "moderator",
      name: "Moderator User",
      role: "MODERATOR" as const,
      isEmailVerified: true,
    },
    {
      email: "john.doe@example.com",
      username: "johndoe",
      name: "John Doe",
      role: "USER" as const,
      isEmailVerified: true,
    },
    {
      email: "jane.smith@example.com",
      username: "janesmith",
      name: "Jane Smith",
      role: "USER" as const,
      isEmailVerified: true,
    },
    {
      email: "mike.johnson@example.com",
      username: "mikej",
      name: "Mike Johnson",
      role: "USER" as const,
      isEmailVerified: false,
    },
    {
      email: "sarah.wilson@example.com",
      username: "sarahw",
      name: "Sarah Wilson",
      role: "USER" as const,
      isEmailVerified: true,
    },
  ];

  const createdUsers: Record<string, { id: string }> = {};
  for (const u of usersData) {
    const created = await prisma.user.create({
      data: {
        email: normalizeEmail(u.email),
        username: u.username,
        name: u.name,
        role: u.role,
        isEmailVerified: u.isEmailVerified,
        hashPassword: DUMMY_HASH,
      },
    });
    createdUsers[u.username] = created;
  }
  console.log(
    `✅ Created ${usersData.length} users (admin, moderator, ${usersData.length - 2} regular)`,
  );

  // -------------------------------------------------------------------------
  // 9. Combo kits
  // -------------------------------------------------------------------------
  const comboKits: Array<{
    id: string;
    name: string;
    price: number;
    items?: Array<{ id: string }>;
  }> = [];

  for (const def of [
    {
      name: "Starter Makeup Kit",
      slug: "starter-makeup-kit",
      description: "Foundation, lipstick and eyeshadow — curated starter set.",
      audience: "ALL",
      metaTitle: "Starter Makeup Kit | Pinak",
      metaDescription:
        "A beginner-friendly makeup combo with foundation, lipstick and eyeshadow.",
      metaKeywords: "makeup kit, starter combo, foundation lipstick palette",
      seoKeyword: "starter-makeup-kit",
      imageUrl: "https://example.com/images/combo-starter-makeup-kit.jpg",
      pricingStrategy: "FIXED_PRICE" as const,
      discountType: "PERCENTAGE" as const,
      discountValue: 15,
      tags: ["starter", "makeup", "bestseller"],
      sortOrder: 1,
      viewCount: 250,
      purchasedCount: 14,
      isActive: true,
      items: [
        { sku: "RGF-001", quantity: 1, isRequired: true },
        { sku: "VML-002", quantity: 1, isRequired: true },
        { sku: "SEP-001", quantity: 1, isRequired: true },
      ],
    },
    {
      name: "Hydration & Glow Set",
      slug: "hydration-glow-set",
      description: "Moisturizer + buildable glow foundation.",
      audience: "UNISEX",
      metaTitle: "Hydration & Glow Set | Pinak",
      metaDescription:
        "Hydrating skincare and dewy complexion essentials for daily glow.",
      metaKeywords: "hydration set, moisturizer combo, glow foundation",
      seoKeyword: "hydration-glow-set",
      imageUrl: "https://example.com/images/combo-hydration-glow.jpg",
      pricingStrategy: "CALCULATED" as const,
      discountType: "PERCENTAGE" as const,
      discountValue: 10,
      tags: ["skincare", "glow", "daily-routine"],
      sortOrder: 2,
      viewCount: 190,
      purchasedCount: 9,
      isActive: true,
      items: [
        { sku: "HFM-001", quantity: 1, isRequired: true },
        { sku: "LGF-001", quantity: 1, isRequired: true },
      ],
    },
    {
      name: "Lash & Define Duo",
      slug: "lash-define-duo",
      description: "Volume + waterproof mascara for all-day drama.",
      audience: "WOMEN",
      metaTitle: "Lash & Define Duo | Pinak",
      metaDescription:
        "Two high-performance mascaras for volume, definition and all-day hold.",
      metaKeywords: "mascara duo, lash combo, waterproof mascara",
      seoKeyword: "lash-define-duo",
      imageUrl: "https://example.com/images/combo-lash-define-duo.jpg",
      pricingStrategy: "DYNAMIC" as const,
      discountType: "FIXED_AMOUNT" as const,
      discountValue: 300,
      tags: ["eye-makeup", "mascara", "duo"],
      sortOrder: 3,
      viewCount: 160,
      purchasedCount: 6,
      isActive: true,
      items: [
        { sku: "VBM-001", quantity: 1, isRequired: true },
        { sku: "WM-001", quantity: 1, isRequired: true },
      ],
    },
    {
      name: "Weekend Glam Kit",
      slug: "weekend-glam-kit",
      description: "A richer mix for festive and weekend makeup looks.",
      audience: "ALL",
      metaTitle: "Weekend Glam Kit | Pinak",
      metaDescription:
        "Build elevated looks with a premium glam combo curated for nights out.",
      metaKeywords: "glam kit, festive makeup combo, weekend beauty set",
      seoKeyword: "weekend-glam-kit",
      imageUrl: "https://example.com/images/combo-weekend-glam-kit.jpg",
      pricingStrategy: "FIXED_PRICE" as const,
      discountType: "PERCENTAGE" as const,
      discountValue: 12,
      tags: ["glam", "premium", "makeup"],
      sortOrder: 4,
      viewCount: 120,
      purchasedCount: 2,
      isActive: false,
      items: [
        { sku: "LGF-002", quantity: 1, isRequired: true },
        { sku: "SL-001", quantity: 1, isRequired: true },
        { sku: "MEP-001", quantity: 1, isRequired: false },
      ],
    },
  ]) {
    const resolvedItems = def.items
      .map((item) => {
        const variant = skuToVariant[item.sku];
        if (!variant) return null;
        const originalPrice = variant.price;
        let discountedPrice = originalPrice;
        if (def.discountType === "PERCENTAGE") {
          discountedPrice = Math.round(
            originalPrice * (1 - def.discountValue / 100),
          );
        }
        if (def.discountType === "FIXED_AMOUNT") {
          discountedPrice = Math.max(
            0,
            originalPrice - Math.round(def.discountValue),
          );
        }

        return {
          variant,
          quantity: item.quantity,
          isRequired: item.isRequired,
          originalPrice,
          discountedPrice,
        };
      })
      .filter(Boolean) as Array<{
      variant: { id: string; sku: string; price: number };
      quantity: number;
      isRequired: boolean;
      originalPrice: number;
      discountedPrice: number;
    }>;

    if (resolvedItems.length !== def.items.length) {
      console.warn(`⚠️  Skipping '${def.name}' - missing variant(s)`);
      continue;
    }

    const calculatedTotal = resolvedItems.reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0,
    );
    const finalPrice =
      def.pricingStrategy === "FIXED_PRICE"
        ? Math.max(0, Math.round(calculatedTotal * 0.95))
        : calculatedTotal;

    const kit = await prisma.comboKit.create({
      data: {
        name: def.name,
        slug: def.slug,
        description: def.description,
        audience: def.audience,
        metaTitle: def.metaTitle,
        metaDescription: def.metaDescription,
        metaKeywords: def.metaKeywords,
        seoKeyword: def.seoKeyword,
        imageUrl: def.imageUrl,
        pricingStrategy: def.pricingStrategy,
        discountType: def.discountType,
        discountValue: def.discountValue,
        tags: def.tags,
        sortOrder: def.sortOrder,
        viewCount: def.viewCount,
        purchasedCount: def.purchasedCount,
        isActive: def.isActive,
        price: finalPrice,
        items: {
          create: resolvedItems.map((item, index) => ({
            productVariantId: item.variant.id,
            quantity: item.quantity,
            sortOrder: index,
            originalPrice: item.originalPrice,
            discountedPrice: item.discountedPrice,
            isRequired: item.isRequired,
          })),
        },
      },
      include: { items: true },
    });
    comboKits.push(kit);
  }
  console.log(`✅ Created ${comboKits.length} combo kits`);

  // -------------------------------------------------------------------------
  // 9.1 Carts (include combo usage for dependency checks)
  // -------------------------------------------------------------------------
  const mikeIdForCart = createdUsers["mikej"]?.id;
  if (mikeIdForCart) {
    const cartCreateItems: Array<{
      productVariantId?: string;
      comboKitId?: string;
      quantity: number;
    }> = [];

    if (skuToVariant["VCS-001"]?.id) {
      cartCreateItems.push({
        productVariantId: skuToVariant["VCS-001"].id,
        quantity: 1,
      });
    }

    if (comboKits[0]?.id) {
      cartCreateItems.push({ comboKitId: comboKits[0].id, quantity: 1 });
    }

    if (cartCreateItems.length > 0) {
      await prisma.cart.create({
        data: {
          userId: mikeIdForCart,
          items: {
            create: cartCreateItems,
          },
        },
      });
      console.log("✅ Created cart with product + combo items");
    }
  }

  // -------------------------------------------------------------------------
  // 9.2 Wishlists
  // -------------------------------------------------------------------------
  const johnIdForWishlist = createdUsers["johndoe"]?.id;
  if (johnIdForWishlist) {
    const wishlistCreateItems: Array<{ productVariantId: string }> = [];

    if (skuToVariant["RGF-001"]?.id) {
      wishlistCreateItems.push({
        productVariantId: skuToVariant["RGF-001"].id,
      });
    }
    if (skuToVariant["VCS-001"]?.id) {
      wishlistCreateItems.push({
        productVariantId: skuToVariant["VCS-001"].id,
      });
    }
    if (skuToVariant["WM-001"]?.id) {
      wishlistCreateItems.push({
        productVariantId: skuToVariant["WM-001"].id,
      });
    }

    if (wishlistCreateItems.length > 0) {
      await prisma.wishlist.create({
        data: {
          userId: johnIdForWishlist,
          items: {
            create: wishlistCreateItems,
          },
        },
      });
      console.log(
        `✅ Created wishlist with ${wishlistCreateItems.length} variant items`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // 10. Coupons
  // -------------------------------------------------------------------------
  const now = new Date();
  const in6Months = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOderValue: 1000,
        maxDiscountValue: 500,
        validFrom: now,
        validUntil: in6Months,
        maxTotalUsers: 1000,
        maxUsesPerUser: 1,
        isActive: true,
      },
      {
        code: "FLAT200",
        discountType: "FLAT",
        discountValue: 200,
        minOderValue: 2000,
        validFrom: now,
        validUntil: in6Months,
        maxUsesPerUser: 2,
        isActive: true,
      },
      {
        code: "SKINCARE15",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOderValue: 3000,
        maxDiscountValue: 750,
        validFrom: now,
        validUntil: in6Months,
        isActive: true,
      },
    ],
  });
  console.log("✅ Created 3 coupons (WELCOME10, FLAT200, SKINCARE15)");

  // -------------------------------------------------------------------------
  // 11. Orders with order items
  // -------------------------------------------------------------------------
  const johnId = createdUsers["johndoe"].id;
  const janeId = createdUsers["janesmith"].id;
  const sarahId = createdUsers["sarahw"].id;

  async function productIdBySku(sku: string): Promise<string | null> {
    const v = await prisma.productVariant.findUnique({
      where: { sku },
      select: { productId: true },
    });
    return v?.productId ?? null;
  }

  const rgf001 = skuToVariant["RGF-001"];
  const vml001 = skuToVariant["VML-001"];
  const hfm001 = skuToVariant["HFM-001"];
  const vcs001 = skuToVariant["VCS-001"];
  const lgf001 = skuToVariant["LGF-001"];
  const sep001 = skuToVariant["SEP-001"];

  const johnOrder = await prisma.order.create({
    data: {
      userId: johnId,
      status: "DELIVERED",
      paymentStatus: "COMPLETED",
      subtotalAmount: rgf001.price + vml001.price,
      taxAmount: Math.round((rgf001.price + vml001.price) * 0.12),
      shippingAmount: 99,
      totalAmount: Math.round((rgf001.price + vml001.price) * 1.12) + 99,
    },
  });
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: johnOrder.id,
        productId: await productIdBySku("RGF-001"),
        productVariantId: rgf001.id,
        productName: "Radiant Glow Foundation — Light Beige 30ml",
        price: rgf001.price,
        quantity: 1,
      },
      {
        orderId: johnOrder.id,
        productId: await productIdBySku("VML-001"),
        productVariantId: vml001.id,
        productName: "Velvet Matte Lipstick — Ruby Red 4g",
        price: vml001.price,
        quantity: 2,
      },
    ],
  });

  const janeOrder = await prisma.order.create({
    data: {
      userId: janeId,
      status: "PROCESSING",
      paymentStatus: "COMPLETED",
      subtotalAmount: hfm001.price + vcs001.price + (comboKits[1]?.price ?? 0),
      taxAmount: Math.round(
        (hfm001.price + vcs001.price + (comboKits[1]?.price ?? 0)) * 0.18,
      ),
      shippingAmount: 0,
      totalAmount: Math.round(
        (hfm001.price + vcs001.price + (comboKits[1]?.price ?? 0)) * 1.18,
      ),
    },
  });
  const janeOrderItems: Array<{
    orderId: string;
    productId?: string | null;
    productVariantId?: string | null;
    comboKitId?: string | null;
    productName: string;
    price: number;
    quantity: number;
  }> = [
    {
      orderId: janeOrder.id,
      productId: await productIdBySku("HFM-001"),
      productVariantId: hfm001.id,
      productName: "Hydrating Face Moisturizer 50ml",
      price: hfm001.price,
      quantity: 1,
    },
    {
      orderId: janeOrder.id,
      productId: await productIdBySku("VCS-001"),
      productVariantId: vcs001.id,
      productName: "Vitamin C Serum 30ml",
      price: vcs001.price,
      quantity: 1,
    },
  ];
  if (comboKits[1]) {
    janeOrderItems.push({
      orderId: janeOrder.id,
      comboKitId: comboKits[1].id,
      productName: comboKits[1].name,
      price: comboKits[1].price,
      quantity: 1,
    });
  }
  await prisma.orderItem.createMany({ data: janeOrderItems });

  const sarahOrder = await prisma.order.create({
    data: {
      userId: sarahId,
      status: "SHIPPED",
      paymentStatus: "COMPLETED",
      subtotalAmount: lgf001.price + sep001.price,
      taxAmount: Math.round((lgf001.price + sep001.price) * 0.12),
      shippingAmount: 99,
      totalAmount: Math.round((lgf001.price + sep001.price) * 1.12) + 99,
    },
  });
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: sarahOrder.id,
        productId: await productIdBySku("LGF-001"),
        productVariantId: lgf001.id,
        productName: "Liquid Glow Foundation — Porcelain 35ml",
        price: lgf001.price,
        quantity: 1,
      },
      {
        orderId: sarahOrder.id,
        productId: await productIdBySku("SEP-001"),
        productVariantId: sep001.id,
        productName: "Shimmer Eyeshadow Palette — Warm Tones 12g",
        price: sep001.price,
        quantity: 1,
      },
    ],
  });

  console.log("✅ Created 3 orders (DELIVERED, PROCESSING, SHIPPED)");

  // -------------------------------------------------------------------------
  // 12. Reviews
  // -------------------------------------------------------------------------
  for (const r of [
    {
      username: "johndoe",
      slug: "radiant-glow-foundation",
      rating: 5,
      body: "Amazing coverage, feels so light on the skin!",
    },
    {
      username: "johndoe",
      slug: "velvet-matte-lipstick",
      rating: 4,
      body: "Great color payoff, lasts all day.",
    },
    {
      username: "janesmith",
      slug: "hydrating-face-moisturizer",
      rating: 5,
      body: "My skin feels so soft after using this. Highly recommend.",
    },
    {
      username: "janesmith",
      slug: "vitamin-c-serum",
      rating: 4,
      body: "Noticed a visible improvement in brightness within 2 weeks.",
    },
    {
      username: "sarahw",
      slug: "liquid-glow-foundation",
      rating: 5,
      body: "Perfect finish for my skin type. Absolutely love it!",
    },
    {
      username: "sarahw",
      slug: "shimmer-eyeshadow-palette",
      rating: 4,
      body: "Beautiful pigmentation, the warm tones palette is stunning.",
    },
  ]) {
    const user = createdUsers[r.username];
    const productId = slugToId[r.slug];
    if (!user || !productId) {
      console.warn(`⚠️  Skipping review for ${r.slug}`);
      continue;
    }
    await prisma.review.create({
      data: { productId, userId: user.id, rating: r.rating, body: r.body },
    });
  }
  console.log("✅ Created 6 reviews");

  // -------------------------------------------------------------------------
  // 13. Articles
  // -------------------------------------------------------------------------
  await prisma.article.createMany({
    data: [
      {
        title: "5 Foundation Tips for a Flawless Look",
        slug: "5-foundation-tips-flawless-look",
        content: "Foundation is the base of every great makeup look...",
        type: "BLOG",
        author: "Beauty Expert",
        publishedAt: new Date("2025-12-01"),
        isActive: true,
      },
      {
        title: "How to Build a Skincare Routine",
        slug: "how-to-build-skincare-routine",
        content:
          "A great skincare routine starts with cleansing, toning, moisturizing and SPF...",
        type: "TUTORIAL",
        author: "Skincare Specialist",
        publishedAt: new Date("2026-01-10"),
        isActive: true,
      },
      {
        title: "Spring 2026 Makeup Trends",
        slug: "spring-2026-makeup-trends",
        content:
          "This season is all about dewy skin, bold lips and natural brows...",
        type: "NEWS",
        author: "Editor",
        publishedAt: new Date("2026-02-01"),
        isActive: true,
      },
    ],
  });
  console.log("✅ Created 3 articles");

  // -------------------------------------------------------------------------
  // 14. Stores
  // -------------------------------------------------------------------------
  await prisma.store.createMany({
    data: [
      {
        name: "Pinak Mumbai Flagship",
        address: "101, Linking Road",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400054",
        phone: "+91-22-4000-1000",
        latitude: 19.0596,
        longitude: 72.8295,
      },
      {
        name: "Pinak Delhi Store",
        address: "45, Connaught Place",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110001",
        phone: "+91-11-4000-2000",
        latitude: 28.6315,
        longitude: 77.2167,
      },
      {
        name: "Pinak Bangalore Store",
        address: "12, Brigade Road",
        city: "Bangalore",
        state: "Karnataka",
        zipCode: "560001",
        phone: "+91-80-4000-3000",
        latitude: 12.9758,
        longitude: 77.6095,
      },
    ],
  });
  console.log("✅ Created 3 stores");

  // -------------------------------------------------------------------------
  // 15. Quiz questions, options & rules
  // -------------------------------------------------------------------------
  const q1 = await prisma.quizQuestion.create({
    data: {
      questoin: "What is your skin type?",
      type: "SINGLE_CHOICE",
      options: {
        create: [
          { text: "Oily" },
          { text: "Dry" },
          { text: "Combination" },
          { text: "Normal" },
          { text: "Sensitive" },
        ],
      },
    },
  });
  const q2 = await prisma.quizQuestion.create({
    data: {
      questoin: "What is your preferred makeup finish?",
      type: "SINGLE_CHOICE",
      options: {
        create: [
          { text: "Matte" },
          { text: "Dewy / Glow" },
          { text: "Satin / Natural" },
          { text: "Shimmer" },
        ],
      },
    },
  });
  await prisma.quizQuestion.create({
    data: {
      questoin:
        "Which concerns do you want to address? (Select all that apply)",
      type: "MULTIPLE_CHOICE",
      options: {
        create: [
          { text: "Dryness" },
          { text: "Dullness / Uneven tone" },
          { text: "Fine lines" },
          { text: "Acne / Breakouts" },
          { text: "Dark circles" },
        ],
      },
    },
  });
  await prisma.quizRule.createMany({
    data: [
      {
        condition: { questionId: q1.id, answer: "Dry" },
        productId: slugToId["hydrating-face-moisturizer"],
      },
      {
        condition: { questionId: q1.id, answer: "Oily" },
        productId: slugToId["vitamin-c-serum"],
      },
      {
        condition: { questionId: q2.id, answer: "Matte" },
        productId: slugToId["velvet-matte-lipstick"],
      },
      {
        condition: { questionId: q2.id, answer: "Dewy / Glow" },
        productId: slugToId["liquid-glow-foundation"],
      },
    ].filter((r) => r.productId) as Array<{
      condition: object;
      productId: string;
    }>,
  });
  console.log("✅ Created 3 quiz questions with options & rules");

  // -------------------------------------------------------------------------
  // 16. Backfill purchasedCount from seeded orders
  // -------------------------------------------------------------------------
  const metricSums = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: { not: null },
      order: { isDeleted: false, status: { not: "CANCELLED" } },
    },
    _sum: { quantity: true },
  });
  for (const row of metricSums) {
    if (!row.productId) continue;
    await prisma.product.update({
      where: { id: row.productId },
      data: { purchasedCount: row._sum.quantity ?? 0 },
    });
  }
  console.log(`✅ Backfilled purchasedCount for ${metricSums.length} products`);

  const comboMetricSums = await prisma.orderItem.groupBy({
    by: ["comboKitId"],
    where: {
      comboKitId: { not: null },
      order: { isDeleted: false, status: { not: "CANCELLED" } },
    },
    _sum: { quantity: true },
  });
  for (const row of comboMetricSums) {
    if (!row.comboKitId) continue;
    await prisma.comboKit.update({
      where: { id: row.comboKitId },
      data: { purchasedCount: row._sum.quantity ?? 0 },
    });
  }
  console.log(
    `✅ Backfilled purchasedCount for ${comboMetricSums.length} combo kits`,
  );

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  const totalVariants = productDefs.reduce(
    (acc, p) => acc + p.variants.length,
    0,
  );
  console.log(`
🎉 Database seeding completed successfully!
📊 Summary:
  - 2 parent + 6 leaf categories (2-level hierarchy)
  - ${productDefs.length} products (linked to taxClass, lengthClass, weightClass)
  - ${totalVariants} product variants + ${totalVariants} images
  - 5 featured sections + ${featuredEntries.length} featured products
  - ${usersData.length} users (1 admin, 1 moderator, ${usersData.length - 2} regular)
  - ${comboKits.length} combo kits
  - 1 cart with combo + variant items
  - 1 wishlist with 3 variant items
  - 3 coupons · 3 orders · 6 reviews · 3 articles · 3 stores
  - 3 quiz questions with options & rules
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
