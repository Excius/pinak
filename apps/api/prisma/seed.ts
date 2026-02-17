import { prisma } from "../src/lib/prisma.js";
import { normalizeEmail } from "../src/lib/email.js";

async function cleanup() {
  console.log("🧹 Cleaning up existing data...");

  // Delete in order to respect foreign key constraints
  await prisma.featuredProduct.deleteMany();
  await prisma.featuredSection.deleteMany();
  await prisma.productImage.deleteMany();

  // Remove combo kit items and combo kits before product variants (they reference productVariant)
  await prisma.comboKitItem.deleteMany();
  await prisma.comboKit.deleteMany();

  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleanup completed");
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data first
  await cleanup();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Foundation",
        slug: "foundation",
      },
    }),
    prisma.category.create({
      data: {
        name: "Lipstick",
        slug: "lipstick",
      },
    }),
    prisma.category.create({
      data: {
        name: "Mascara",
        slug: "mascara",
      },
    }),
    prisma.category.create({
      data: {
        name: "Eyeshadow",
        slug: "eyeshadow",
      },
    }),
    prisma.category.create({
      data: {
        name: "Skincare",
        slug: "skincare",
      },
    }),
  ]);

  console.log("✅ Created categories");

  // Create products with variants
  const products = [
    {
      name: "Radiant Glow Foundation",
      slug: "radiant-glow-foundation",
      description: "A lightweight foundation that provides natural coverage",
      brand: "GlowBeauty",
      categoryId: categories[0].id,
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
    },
    {
      name: "Velvet Matte Lipstick",
      slug: "velvet-matte-lipstick",
      description: "Long-lasting matte lipstick with intense color payoff",
      brand: "LipLux",
      categoryId: categories[1].id,
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
    },
    {
      name: "Volume Boost Mascara",
      slug: "volume-boost-mascara",
      description: "Dramatic volume and length for your lashes",
      brand: "LashQueen",
      categoryId: categories[2].id,
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
    },
    {
      name: "Shimmer Eyeshadow Palette",
      slug: "shimmer-eyeshadow-palette",
      description: "12 shades of shimmering eyeshadows for versatile looks",
      brand: "EyeGlow",
      categoryId: categories[3].id,
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
    },
    {
      name: "Hydrating Face Moisturizer",
      slug: "hydrating-face-moisturizer",
      description: "Deep hydration for all skin types",
      brand: "SkinCare Plus",
      categoryId: categories[4].id,
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
    },
    {
      name: "Liquid Glow Foundation",
      slug: "liquid-glow-foundation",
      description: "Buildable coverage with a natural glow finish",
      brand: "GlowBeauty",
      categoryId: categories[0].id,
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
    },
    {
      name: "Satin Lipstick",
      slug: "satin-lipstick",
      description: "Creamy satin finish lipstick that feels luxurious",
      brand: "LipLux",
      categoryId: categories[1].id,
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
    },
    {
      name: "Waterproof Mascara",
      slug: "waterproof-mascara",
      description: "Smudge-proof, waterproof formula for all-day wear",
      brand: "LashQueen",
      categoryId: categories[2].id,
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
    },
    {
      name: "Matte Eyeshadow Palette",
      slug: "matte-eyeshadow-palette",
      description: "Highly pigmented matte shades for professional looks",
      brand: "EyeGlow",
      categoryId: categories[3].id,
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
    },
    {
      name: "Vitamin C Serum",
      slug: "vitamin-c-serum",
      description: "Brightening serum with 20% Vitamin C for radiant skin",
      brand: "SkinCare Plus",
      categoryId: categories[4].id,
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
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        brand: productData.brand,
        categoryId: productData.categoryId,
      },
    });

    // Create variants for this product
    for (const variant of productData.variants) {
      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variant.sku,
          shade: variant.shade,
          size: variant.size,
          price: variant.price,
          stock: variant.stock,
          tags: variant.tags || [],
        },
      });

      // Add a sample image for each variant
      await prisma.productImage.create({
        data: {
          productVariantId: createdVariant.id,
          url: `https://example.com/images/${productData.slug}-${variant.sku.toLowerCase()}.jpg`,
          altText: `${productData.name} - ${variant.shade || variant.size}`,
          isPrimary: true,
        },
      });
    }
  }

  console.log("✅ Created products with variants and images");

  // Create featured sections
  const featuredSections = await Promise.all([
    prisma.featuredSection.create({
      data: {
        title: "Expert Picks",
        type: "EXPERT_PICKS",
        priority: 10,
      },
    }),
    prisma.featuredSection.create({
      data: {
        title: "Homepage Hero",
        type: "HOMEPAGE_HERO",
        priority: 20,
      },
    }),
    prisma.featuredSection.create({
      data: {
        title: "Special Deals",
        type: "DEALS",
        priority: 5,
      },
    }),
  ]);

  console.log("✅ Created featured sections");

  // Get all created products to feature some of them
  const allProducts = await prisma.product.findMany({ take: 10 });

  // Add featured products to sections
  const featuredProducts = [
    // Homepage Hero - top priority products
    { sectionId: featuredSections[1].id, productId: allProducts[0].id }, // Radiant Glow Foundation
    { sectionId: featuredSections[1].id, productId: allProducts[1].id }, // Velvet Matte Lipstick

    // Expert Picks - curated selection
    { sectionId: featuredSections[0].id, productId: allProducts[2].id }, // Volume Boost Mascara
    { sectionId: featuredSections[0].id, productId: allProducts[3].id }, // Shimmer Eyeshadow
    { sectionId: featuredSections[0].id, productId: allProducts[4].id }, // Hydrating Moisturizer

    // Special Deals - discounted items
    { sectionId: featuredSections[2].id, productId: allProducts[5].id }, // Liquid Glow Foundation
    { sectionId: featuredSections[2].id, productId: allProducts[6].id }, // Satin Lipstick
  ];

  for (const featured of featuredProducts) {
    await prisma.featuredProduct.create({
      data: featured,
    });
  }

  console.log("✅ Created featured products");

  // Create users
  const users = [
    {
      email: "admin@pinak.com",
      username: "admin",
      name: "Admin User",
      role: "ADMIN" as const,
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

  for (const userData of users) {
    await prisma.user.create({
      data: {
        email: normalizeEmail(userData.email),
        username: userData.username,
        name: userData.name,
        role: userData.role,
        isEmailVerified: userData.isEmailVerified,
        hashPassword: "$argon2id$v=19$m=65536,t=3,p=4$dummy_hash_for_testing", // Dummy hash
      },
    });
  }

  console.log("✅ Created users");

  // --- Seed ComboKits ---
  const variantSkus = [
    "RGF-001", // Radiant Glow Foundation - Light Beige
    "VML-002", // Velvet Matte Lipstick - Nude Pink
    "SEP-001", // Shimmer Eyeshadow Palette - Warm Tones
    "HFM-001", // Hydrating Face Moisturizer - 50ml
    "LGF-001", // Liquid Glow Foundation - Porcelain
    "VBM-001", // Volume Boost Mascara - Black
    "WM-001", // Waterproof Mascara - Jet Black
  ];

  const variants = await prisma.productVariant.findMany({
    where: { sku: { in: variantSkus } },
  });
  const vBySku = Object.fromEntries(variants.map((v) => [v.sku, v]));

  const comboKits: Array<{ items?: Array<{ id: string }> }> = [];

  if (vBySku["RGF-001"] && vBySku["VML-002"] && vBySku["SEP-001"]) {
    const starterPrice =
      vBySku["RGF-001"].price +
      vBySku["VML-002"].price +
      vBySku["SEP-001"].price;
    const starter = await prisma.comboKit.create({
      data: {
        name: "Starter Makeup Kit",
        slug: "starter-makeup-kit",
        description:
          "Foundation, lipstick and eyeshadow — curated starter set.",
        audience: "ALL",
        price: Math.round(starterPrice * 0.85), // 15% off
        items: {
          create: [
            { productVariantId: vBySku["RGF-001"].id, quantity: 1 },
            { productVariantId: vBySku["VML-002"].id, quantity: 1 },
            { productVariantId: vBySku["SEP-001"].id, quantity: 1 },
          ],
        },
      },
      include: { items: true },
    });
    comboKits.push(starter);
  } else {
    console.warn("⚠️ Skipping Starter Makeup Kit - missing variant(s)");
  }

  if (vBySku["HFM-001"] && vBySku["LGF-001"]) {
    const hydraPrice = vBySku["HFM-001"].price + vBySku["LGF-001"].price;
    const hydra = await prisma.comboKit.create({
      data: {
        name: "Hydration & Glow Set",
        slug: "hydration-glow-set",
        description: "Moisturizer + buildable glow foundation.",
        audience: "UNISEX",
        price: Math.round(hydraPrice * 0.9), // 10% off
        items: {
          create: [
            { productVariantId: vBySku["HFM-001"].id, quantity: 1 },
            { productVariantId: vBySku["LGF-001"].id, quantity: 1 },
          ],
        },
      },
      include: { items: true },
    });
    comboKits.push(hydra);
  } else {
    console.warn("⚠️ Skipping Hydration & Glow Set - missing variant(s)");
  }

  if (vBySku["VBM-001"] && vBySku["WM-001"]) {
    const lashPrice = vBySku["VBM-001"].price + vBySku["WM-001"].price;
    const lashes = await prisma.comboKit.create({
      data: {
        name: "Lash & Define Duo",
        slug: "lash-define-duo",
        description: "Volume + waterproof for all-day drama.",
        audience: "WOMEN",
        price: Math.round(lashPrice * 0.88), // 12% off
        items: {
          create: [
            { productVariantId: vBySku["VBM-001"].id, quantity: 1 },
            { productVariantId: vBySku["WM-001"].id, quantity: 1 },
          ],
        },
      },
      include: { items: true },
    });
    comboKits.push(lashes);
  } else {
    console.warn("⚠️ Skipping Lash & Define Duo - missing variant(s)");
  }

  console.log(`✅ Created ${comboKits.length} combo kits (seed)`);

  // Final summary
  console.log("🎉 Database seeding completed successfully!");
  console.log(`📊 Summary:
  - ${categories.length} categories
  - ${products.length} products
  - ${products.reduce((acc, p) => acc + p.variants.length, 0)} product variants
  - ${products.reduce((acc, p) => acc + p.variants.length, 0)} product images
  - ${featuredSections.length} featured sections
  - ${featuredProducts.length} featured products
  - ${users.length} users
  - ${comboKits.length} combo kits
  - ${comboKits.reduce((acc, c) => acc + (c.items?.length || 0), 0)} combo kit items
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
