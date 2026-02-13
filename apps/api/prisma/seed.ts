import { prisma } from "../src/lib/prisma.js";

async function cleanup() {
  console.log("🧹 Cleaning up existing data...");

  // Delete in order to respect foreign key constraints
  await prisma.featuredProduct.deleteMany();
  await prisma.featuredSection.deleteMany();
  await prisma.productImage.deleteMany();
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
        },
        {
          sku: "RGF-002",
          shade: "Medium Beige",
          size: "30ml",
          price: 4500,
          stock: 30,
        },
        {
          sku: "RGF-003",
          shade: "Deep Beige",
          size: "30ml",
          price: 4500,
          stock: 20,
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
        },
        {
          sku: "VML-002",
          shade: "Nude Pink",
          size: "4g",
          price: 2800,
          stock: 35,
        },
        {
          sku: "VML-003",
          shade: "Deep Plum",
          size: "4g",
          price: 2800,
          stock: 28,
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
        },
        {
          sku: "VBM-002",
          shade: "Brown",
          size: "10ml",
          price: 2200,
          stock: 45,
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
        },
        {
          sku: "SEP-002",
          shade: "Cool Tones",
          size: "12g",
          price: 3800,
          stock: 18,
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
        { sku: "HFM-001", shade: null, size: "50ml", price: 3200, stock: 60 },
        { sku: "HFM-002", shade: null, size: "100ml", price: 5200, stock: 40 },
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
        },
        {
          sku: "LGF-002",
          shade: "Ivory",
          size: "35ml",
          price: 4800,
          stock: 28,
        },
        { sku: "LGF-003", shade: "Sand", size: "35ml", price: 4800, stock: 19 },
      ],
    },
    {
      name: "Satin Lipstick",
      slug: "satin-lipstick",
      description: "Creamy satin finish lipstick that feels luxurious",
      brand: "LipLux",
      categoryId: categories[1].id,
      variants: [
        { sku: "SL-001", shade: "Coral", size: "4g", price: 2600, stock: 32 },
        { sku: "SL-002", shade: "Rose", size: "4g", price: 2600, stock: 29 },
        { sku: "SL-003", shade: "Berry", size: "4g", price: 2600, stock: 24 },
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
        },
        {
          sku: "WM-002",
          shade: "Deep Brown",
          size: "8ml",
          price: 2500,
          stock: 42,
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
        },
        { sku: "MEP-002", shade: "Smoky", size: "15g", price: 4200, stock: 16 },
      ],
    },
    {
      name: "Vitamin C Serum",
      slug: "vitamin-c-serum",
      description: "Brightening serum with 20% Vitamin C for radiant skin",
      brand: "SkinCare Plus",
      categoryId: categories[4].id,
      variants: [
        { sku: "VCS-001", shade: null, size: "30ml", price: 5800, stock: 25 },
        { sku: "VCS-002", shade: null, size: "50ml", price: 8500, stock: 15 },
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
        email: userData.email,
        username: userData.username,
        name: userData.name,
        role: userData.role,
        isEmailVerified: userData.isEmailVerified,
        hashPassword: "$argon2id$v=19$m=65536,t=3,p=4$dummy_hash_for_testing", // Dummy hash
      },
    });
  }

  console.log("✅ Created users");

  console.log("🎉 Database seeding completed successfully!");
  console.log(`📊 Summary:
  - ${categories.length} categories
  - ${products.length} products
  - ${products.reduce((acc, p) => acc + p.variants.length, 0)} product variants
  - ${products.reduce((acc, p) => acc + p.variants.length, 0)} product images
  - ${featuredSections.length} featured sections
  - ${featuredProducts.length} featured products
  - ${users.length} users
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
