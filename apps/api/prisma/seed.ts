import { prisma } from "../src/lib/prisma.js";
import { normalizeEmail } from "../src/lib/email.js";
import { Passwordhasher } from "../src/lib/password.js";
import { syncProductFilterIndex } from "../src/lib/filterIndex.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Static pages & site settings
// ---------------------------------------------------------------------------
const defaultPages = [
  {
    slug: "about-us",
    title: "About Us",
    metaTitle: "About Us | Pinak Beauty",
    metaDescription:
      "Discover our story, craftsmanship and mission rooted in Indian traditions.",
    content: `# About Pinak Beauty

Affordable luxury beauty rooted in rich Indian traditions and inspired by the timeless glow of nature.

## Our Philosophy
At Pinak, we believe that true beauty begins with authenticity. Our formulations marry centuries-old Ayurvedic wisdom with modern cosmetic science to create high-performance, skin-loving products that celebrate every tone and texture.

## Craftsmanship & Purity
- **Cruelty-Free & Conscious**: We never test on animals.
- **Dermatologist-Tested**: Gentle yet efficacious formulations.
- **Sustainably Sourced**: Ethically sourced botanicals from across India.

## Our Mission
To democratize luxury beauty by making premium, clean, and elegant cosmetic formulations accessible to everyone.`,
    isActive: true,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    metaTitle: "Privacy Policy | Pinak Beauty",
    metaDescription:
      "Learn how Pinak Beauty protects and respects your personal data.",
    content: `# Privacy Policy

*Last updated: November 2026*

Pinak Beauty ("we", "our", or "us") is dedicated to protecting your privacy and safeguarding your personal information.

## Information We Collect
1. **Personal Information**: Name, email address, phone number, shipping and billing address provided during checkout or account registration.
2. **Payment Information**: Processed securely via PCI-DSS compliant payment gateways. We do not store raw credit card numbers.
3. **Usage Data**: Device information, IP address, and browsing actions on our website to enhance your shopping experience.

## How We Use Your Information
- To fulfill and deliver your orders.
- To communicate order updates, invoices, and customer care responses.
- To send promotional newsletters (only with your opt-in consent).
- To prevent fraudulent transactions and maintain platform security.

## Data Protection
We employ industry-standard SSL encryption and security controls. We do not sell or lease your personal information to third parties.

## Contact Us
If you have questions regarding this Privacy Policy, please email **support@pinak.com**.`,
    isActive: true,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    metaTitle: "Terms & Conditions | Pinak Beauty",
    metaDescription: "Terms governing the use of Pinak website and services.",
    content: `# Terms & Conditions

*Last updated: November 2026*

Welcome to Pinak Beauty. By accessing or using our website, you agree to comply with and be bound by the following terms.

## 1. General Conditions
We reserve the right to refuse service to anyone for any reason at any time. Prices for our products are subject to change without prior notice.

## 2. Products & Pricing
All product prices are quoted in Indian Rupees (₹) and include applicable taxes unless specified otherwise. We make every effort to display the colors and images of our products as accurately as possible.

## 3. Order Acceptance
Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to cancel or limit quantities on any order.

## 4. User Conduct
You agree not to reproduce, duplicate, copy, sell, or exploit any portion of the service or website content without express written permission from Pinak Beauty.`,
    isActive: true,
  },
  {
    slug: "shipping-policy",
    title: "Shipping & Delivery Policy",
    metaTitle: "Shipping & Delivery Policy | Pinak Beauty",
    metaDescription:
      "Everything you need to know about our shipping rates and delivery timelines.",
    content: `# Shipping & Delivery Policy

Thank you for choosing Pinak Beauty. Here are the details of our shipping policy:

## Delivery Timelines
- **Metro Cities**: 2 to 4 business days.
- **Rest of India**: 4 to 7 business days.
- **Express Shipping**: Available at checkout for select PIN codes.

## Shipping Charges
- **Free Shipping**: On all prepaid orders above ₹499.
- **Standard Shipping**: ₹50 for orders below ₹499.
- **Cash on Delivery (COD)**: Available for orders up to ₹5,000 with a nominal convenience fee.

## Order Tracking
Once your package is dispatched, you will receive an SMS and email notification with your tracking link. You can also track your orders live in your **My Orders** dashboard.`,
    isActive: true,
  },
  {
    slug: "return-refund-policy",
    title: "Return & Refund Policy",
    metaTitle: "Return & Refund Policy | Pinak Beauty",
    metaDescription:
      "Our transparent 7-day return and hassle-free refund guidelines.",
    content: `# Return & Refund Policy

We want you to love your Pinak experience. If you are not completely satisfied, we are here to help.

## Eligibility for Returns
- Requests must be initiated within **7 days** of delivery.
- Products must be unopened, unused, and in their original packaging with security seals intact due to hygiene standards.
- In case of transit damage or wrong item received, please share unboxing photos/videos with **support@pinak.com** within 48 hours of delivery.

## Refund Process
- Once inspected and approved, refunds are processed within 5-7 business days to your original payment method.
- For COD orders, refunds are credited via NEFT / UPI to your provided account details.`,
    isActive: true,
  },
];

const defaultSettings = [
  {
    key: "WHATSAPP_NUMBER",
    value: "+919876543210",
    group: "contact",
    description: "Customer support WhatsApp number for direct chat",
    isPublic: true,
  },
  {
    key: "WHATSAPP_DEFAULT_MESSAGE",
    value: "Hello! I would like to know more about Pinak products.",
    group: "contact",
    description: "Pre-filled WhatsApp greeting message",
    isPublic: true,
  },
  {
    key: "SUPPORT_EMAIL",
    value: "support@pinak.com",
    group: "contact",
    description: "Official customer support email",
    isPublic: true,
  },
  {
    key: "SUPPORT_PHONE",
    value: "+919876543210",
    group: "contact",
    description: "Customer support phone number",
    isPublic: true,
  },
  // Shipping charge (paise) — editable in Admin → Settings → Shipping
  {
    key: "SHIPPING_FEE",
    value: "10000",
    group: "shipping",
    description: "Flat shipping charge in paise for orders that need shipping",
    isPublic: true,
  },
  // Supplier details printed on invoices — editable in Admin → Settings → Supplier Details
  ...Object.entries({
    SUPPLIER_COMPANY_NAME: "Pinak Beauty & Care Pvt. Ltd.",
    SUPPLIER_GSTIN: "27AAACP1234A1Z5",
    SUPPLIER_PAN: "AAACP1234A",
    SUPPLIER_STATE: "Maharashtra",
    SUPPLIER_ADDRESS_LINE1: "Building A, Tech Park, BKC",
    SUPPLIER_ADDRESS_LINE2: "",
    SUPPLIER_CITY: "Mumbai",
    SUPPLIER_PINCODE: "400051",
    SUPPLIER_EMAIL: "support@pinak.com",
    SUPPLIER_PHONE: "+91-22-4000-1000",
  }).map(([key, value]) => ({
    key,
    value,
    group: "supplier",
    description: "Supplier details printed on tax invoices",
    isPublic: false,
  })),
];

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
  try {
    await prisma.featuredSectionImage.deleteMany();
  } catch {}
  await prisma.featuredProduct.deleteMany();
  await prisma.featuredSection.deleteMany();

  // Product-related (images, combo kits, variants, products)
  try {
    await prisma.categoryImage.deleteMany();
  } catch {}
  try {
    await prisma.comboKitImage.deleteMany();
  } catch {}
  await prisma.variantFilterValue.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.comboKitItem.deleteMany();
  await prisma.comboKit.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  // Supporting structures
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Content / misc
  await prisma.page.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.article.deleteMany();
  await prisma.store.deleteMany();
  await prisma.dynamicAsset.deleteMany();
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

  // Load product image URLs from file
  const imagesPath = path.join(__dirname, "productimage.txt");
  const imagesContent = await fs.readFile(imagesPath, "utf-8");
  const productImages = imagesContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  let imageCounter = 0;

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
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgdhlMGc4OQ2oy4ze8gfCY4wYUcajDX1_LT-a1KXKF0Gt5RPFV21noNxkXgydtab-3uMflTDWNsnULfJhICLNSfVxv_S64okiaJKmyvoH3eAM6S_msRDL7tnC1P87gHWt7Gfyfh9E2tS3XqQ1_89cOqGi0uzIeBSPFIQKhHsl-YAC_aCdeoYdQzor-g3kE01wZ6q9a1dvMUNRi-vTPA5tsyPkoC7lgtiKYmlh6V0DDO2y4wZ14FevFS1cqgzYHX7CPOVSys3fnT_g",
        altText: "Makeup — primary image",
        isPrimary: true,
        sortOrder: 0,
      },
    });

    await prisma.categoryImage.create({
      data: {
        categoryId: catMakeup.id,
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_j8yD9DHW29mHnnddf_ulUuyvgRSlVpd7WOvHqGzyrI2P0WjITqrHksEYsluf9wuc50_DDVGm7Y92OFIc_nh4ul5cddIS7BVPwYwTlDoEjb9WG7JxzXuJiSyB7mOVXnxDVVfoMBthI3A00RrHKxUemB6OauNwcgYlIAcAbA_S4XCU2rs4LPGxRvSHTBzpVo-Cahzif-q28vx9eRzuvD446uP7ykBD_wH5LNioMbgOtU8zIqhyfiYn2KoW_LrhR19GjAnr1vXal40",
        altText: "Makeup — secondary image",
        isPrimary: false,
        sortOrder: 1,
      },
    });

    await prisma.categoryImage.create({
      data: {
        categoryId: catSkincareParent.id,
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEEIx79Y5z9Kqec_zbVB23sXahA7BQp9UDSlfXQ0JsPrj1UNb1yW74mh7sCB2xn023FniLEUnnd7JqxBPSvXdUONX-bMyM08qCw0RKfd5V8Q6OT5QkuA-0vTwW98LtFGDOj7ak8BKGaFOGbRatoHDKqKjupce7F4dToYt4_SmuOB4RgsY_Pxtg-NjlUtT46KKuSdAqBL6mZCFUJL3wGlJTqte0ZhoDGdT798ljSd0f3IehTP2h_C82Wl_v5aEjG-tTKke6soUPodo",
        altText: "Skincare — primary image",
        isPrimary: true,
        sortOrder: 0,
      },
    });

    await prisma.categoryImage.create({
      data: {
        categoryId: catSkincareParent.id,
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJxE2dGD3oW_hM50y1Q6caaBYNXL4LsPlod-2TPiXlZ8P95rl9OJQBc27IkaCgqt35uys5MZSHqZBu4rIYh_WLGZYEgXOMGixdPqZPxeiQE0JMD8-K97cfwzwXiQGOU4B3lNGvBcr4P53MADga1vFA0jSlfekEiO61MQpJrrP1UMzJSi-87HsQO2lgDehRYYaWu3tBwrBcRJ1Vlt9wIQKv8Sp7kleZujlLfptB3LtjDX6KXuUCkzgfJk6DCkfmnds3_M4SKLm2Apw",
        altText: "Skincare — secondary image",
        isPrimary: false,
        sortOrder: 1,
      },
    });

    // Images for Foundation category
    await prisma.categoryImage.create({
      data: {
        categoryId: catFoundation.id,
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgdhlMGc4OQ2oy4ze8gfCY4wYUcajDX1_LT-a1KXKF0Gt5RPFV21noNxkXgydtab-3uMflTDWNsnULfJhICLNSfVxv_S64okiaJKmyvoH3eAM6S_msRDL7tnC1P87gHWt7Gfyfh9E2tS3XqQ1_89cOqGi0uzIeBSPFIQKhHsl-YAC_aCdeoYdQzor-g3kE01wZ6q9a1dvMUNRi-vTPA5tsyPkoC7lgtiKYmlh6V0DDO2y4wZ14FevFS1cqgzYHX7CPOVSys3fnT_g",
        altText: "Foundation — primary image",
        isPrimary: true,
        sortOrder: 0,
      },
    });

    // Images for Lipstick category
    await prisma.categoryImage.create({
      data: {
        categoryId: catLipstick.id,
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_j8yD9DHW29mHnnddf_ulUuyvgRSlVpd7WOvHqGzyrI2P0WjITqrHksEYsluf9wuc50_DDVGm7Y92OFIc_nh4ul5cddIS7BVPwYwTlDoEjb9WG7JxzXuJiSyB7mOVXnxDVVfoMBthI3A00RrHKxUemB6OauNwcgYlIAcAbA_S4XCU2rs4LPGxRvSHTBzpVo-Cahzif-q28vx9eRzuvD446uP7ykBD_wH5LNioMbgOtU8zIqhyfiYn2KoW_LrhR19GjAnr1vXal40",
        altText: "Lipstick — primary image",
        isPrimary: true,
        sortOrder: 0,
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

  for (const [fgIndex, fg] of filterGroupsData.entries()) {
    const group = await prisma.filterGroup.create({
      data: {
        name: fg.name,
        slug: fg.slug,
        sortOrder: fgIndex,
        isActive: true,
      },
    });

    filterValueMap[fg.slug] = {};
    for (const [vIndex, v] of fg.values.entries()) {
      const vSlug = v
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const fv = await prisma.filterValue.create({
        data: {
          filterGroupId: group.id,
          name: v,
          slug: vSlug,
          sortOrder: vIndex,
        },
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
          sku: "RGF-001-30",
          shade: "Light Beige",
          size: "30ml",
          price: 450000,
          stock: 25,
          tags: ["matte", "foundation", "light"],
        },
        {
          sku: "RGF-001-50",
          shade: "Light Beige",
          size: "50ml",
          price: 650000,
          stock: 15,
          tags: ["matte", "foundation", "light"],
        },
        {
          sku: "RGF-002-30",
          shade: "Deep Beige",
          size: "30ml",
          price: 450000,
          stock: 20,
          tags: ["matte", "foundation", "deep"],
        },
        {
          sku: "RGF-002-50",
          shade: "Deep Beige",
          size: "50ml",
          price: 650000,
          stock: 10,
          tags: ["matte", "foundation", "deep"],
        },
      ],
      filterSlugs: ["light-beige", "deep-beige", "matte"],
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
          price: 280000,
          stock: 40,
          tags: ["matte", "lipstick", "red"],
        },
        {
          sku: "VML-002",
          shade: "Nude Pink",
          size: "4g",
          price: 280000,
          stock: 35,
          tags: ["matte", "lipstick", "nude"],
        },
        {
          sku: "VML-003",
          shade: "Deep Plum",
          size: "4g",
          price: 280000,
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
          price: 220000,
          stock: 50,
          tags: ["mascara", "volume", "black"],
        },
        {
          sku: "VBM-002",
          shade: "Brown",
          size: "10ml",
          price: 220000,
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
          price: 380000,
          stock: 15,
          tags: ["eyeshadow", "shimmer", "warm"],
        },
        {
          sku: "SEP-002",
          shade: "Cool Tones",
          size: "12g",
          price: 380000,
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
          price: 320000,
          stock: 60,
          tags: ["moisturizer", "skincare", "hydration"],
        },
        {
          sku: "HFM-002",
          shade: null,
          size: "100ml",
          price: 520000,
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
          price: 480000,
          stock: 22,
          tags: ["foundation", "glow", "porcelain"],
        },
        {
          sku: "LGF-002",
          shade: "Ivory",
          size: "35ml",
          price: 480000,
          stock: 28,
          tags: ["foundation", "glow", "ivory"],
        },
        {
          sku: "LGF-003",
          shade: "Sand",
          size: "35ml",
          price: 480000,
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
          price: 260000,
          stock: 32,
          tags: ["lipstick", "satin", "coral"],
        },
        {
          sku: "SL-002",
          shade: "Rose",
          size: "4g",
          price: 260000,
          stock: 29,
          tags: ["lipstick", "satin", "rose"],
        },
        {
          sku: "SL-003",
          shade: "Berry",
          size: "4g",
          price: 260000,
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
          price: 250000,
          stock: 38,
          tags: ["mascara", "waterproof", "black"],
        },
        {
          sku: "WM-002",
          shade: "Deep Brown",
          size: "8ml",
          price: 250000,
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
          price: 420000,
          stock: 12,
          tags: ["eyeshadow", "matte", "neutral"],
        },
        {
          sku: "MEP-002",
          shade: "Smoky",
          size: "15g",
          price: 420000,
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
          price: 580000,
          stock: 25,
          tags: ["serum", "skincare", "vitamin-c"],
        },
        {
          sku: "VCS-002",
          shade: null,
          size: "50ml",
          price: 850000,
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

    const thisProductVariantIds: string[] = [];
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
      thisProductVariantIds.push(createdVariant.id);

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

      const imageUrl =
        productImages[imageCounter] ||
        `https://example.com/images/${productData.slug}-${variant.sku.toLowerCase()}.jpg`;
      imageCounter++;

      await prisma.productImage.create({
        data: {
          productVariantId: createdVariant.id,
          url: imageUrl,
          altText: `${productData.name} — ${variant.shade ?? variant.size}`,
          isPrimary: true,
        },
      });
    }

    // Filters are per variant. The first variant gets every filter for the product;
    // later variants drop the last one so variants genuinely differ.
    const filterIds = filterSlugs.map((slug) => fv(slug)).filter(Boolean);
    for (const [index, variantId] of thisProductVariantIds.entries()) {
      const idsForVariant =
        index > 0 && filterIds.length > 2 ? filterIds.slice(0, -1) : filterIds;
      if (idsForVariant.length) {
        await prisma.variantFilterValue.createMany({
          data: idsForVariant.map((filterValueId) => ({
            variantId,
            filterValueId,
          })),
          skipDuplicates: true,
        });
      }
    }
    // Product-level rows are a derived index of the variants' filters
    await syncProductFilterIndex(prisma, product.id);
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
  // 5.1 Enrich catalog: brand logos, swatches, extra option, SEO, pricing,
  //     dimensions, extra images, stock edge cases, secondary categories
  // -------------------------------------------------------------------------
  const placeholderImage = (label: string) =>
    `https://placehold.co/600x600/png?text=${encodeURIComponent(label)}`;
  const pickImage = (i: number, label: string) =>
    productImages.length > 0
      ? (productImages[i % productImages.length] as string)
      : placeholderImage(label);

  // Brand logos
  let logoIndex = 0;
  for (const [name, brand] of Object.entries(brandMap)) {
    await prisma.brand.update({
      where: { id: brand.id },
      data: { logoUrl: pickImage(logoIndex++, name) },
    });
  }

  // Option / option-value ordering + swatch colours
  await prisma.option.update({
    where: { id: optionSize.id },
    data: { sortOrder: 0 },
  });
  await prisma.option.update({
    where: { id: optionShade.id },
    data: { sortOrder: 1 },
  });
  const shadeSwatches: Record<string, string> = {
    "Light Beige": "#F5DEB3",
    "Medium Beige": "#E0C097",
    "Deep Beige": "#C19A6B",
    "Ruby Red": "#9B111E",
    "Nude Pink": "#E8B4B8",
    "Deep Plum": "#5E2750",
    Black: "#111111",
    Brown: "#6B4423",
    Porcelain: "#F3E5DC",
    Ivory: "#FFFFF0",
    Sand: "#C2B280",
    Coral: "#FF7F50",
    Rose: "#E8A0BF",
    Berry: "#8E2D56",
    "Jet Black": "#0A0A0A",
    "Deep Brown": "#3B2417",
    "Warm Tones": "#D9A066",
    "Cool Tones": "#8FA3BF",
    Neutral: "#BDB5A6",
    Smoky: "#5C5C5C",
  };
  for (const [index, name] of Object.keys(
    optionValueMap.Size ?? {},
  ).entries()) {
    await prisma.optionValue.update({
      where: { id: optionValueMap.Size[name].id },
      data: { sortOrder: index },
    });
  }
  for (const [index, name] of Object.keys(
    optionValueMap.Shade ?? {},
  ).entries()) {
    await prisma.optionValue.update({
      where: { id: optionValueMap.Shade[name].id },
      data: { sortOrder: index, swatchColorHex: shadeSwatches[name] ?? null },
    });
  }

  // Size option values carry the measurements their variants inherit (weight in grams, size in mm)
  const sizeMeasurements: Record<
    string,
    { weightGrams: number; l: number; w: number; h: number }
  > = {
    "30ml": { weightGrams: 90, l: 40, w: 40, h: 105 },
    "35ml": { weightGrams: 100, l: 40, w: 40, h: 110 },
    "50ml": { weightGrams: 130, l: 45, w: 45, h: 120 },
    "100ml": { weightGrams: 230, l: 55, w: 55, h: 150 },
    "200ml": { weightGrams: 420, l: 65, w: 65, h: 185 },
    "4g": { weightGrams: 25, l: 20, w: 20, h: 95 },
    "8ml": { weightGrams: 35, l: 22, w: 22, h: 110 },
    "10ml": { weightGrams: 40, l: 24, w: 24, h: 115 },
    "12g": { weightGrams: 60, l: 70, w: 70, h: 20 },
    "15g": { weightGrams: 75, l: 75, w: 75, h: 22 },
  };
  for (const [name, m] of Object.entries(sizeMeasurements)) {
    const ov = optionValueMap.Size?.[name];
    if (!ov) continue;
    await prisma.optionValue.update({
      where: { id: ov.id },
      data: {
        weightGrams: m.weightGrams,
        weightClassId: gramId,
        dimensionLength: m.l,
        dimensionWidth: m.w,
        dimensionHeight: m.h,
        lengthClassId: mmId,
      },
    });
  }

  // A third option so the dynamic option UI has something beyond Size/Shade
  const optionFinish = await prisma.option.create({
    data: { name: "Finish", sortOrder: 2 },
  });
  const finishValues: Record<string, { id: string }> = {};
  for (const [index, name] of ["Matte", "Glossy", "Satin", "Dewy"].entries()) {
    finishValues[name] = await prisma.optionValue.create({
      data: { optionId: optionFinish.id, value: name, sortOrder: index },
    });
  }
  const finishForSku = (sku: string): string | null =>
    sku.startsWith("VML")
      ? "Matte"
      : sku.startsWith("RGF") || sku.startsWith("LGF")
        ? "Dewy"
        : sku.startsWith("SEP")
          ? "Satin"
          : null;
  for (const v of createdVariants) {
    const finish = finishForSku(v.sku);
    if (finish) {
      await prisma.variantOptionValue.create({
        data: { variantId: v.id, optionValueId: finishValues[finish].id },
      });
    }
  }

  const ingredientsFor = (name: string): string => {
    const n = name.toLowerCase();
    if (/lip|matte/.test(n))
      return "Castor Oil, Shea Butter, Vitamin E, Jojoba Oil, Beeswax";
    if (/foundation|glow/.test(n))
      return "Squalane, Glycerin, Titanium Dioxide, Vitamin E, Hyaluronic Acid";
    if (/serum|moistur|cream|balm/.test(n))
      return "Niacinamide, Hyaluronic Acid, Vitamin C, Aloe Vera, Ceramides";
    if (/mascara|lash|eye/.test(n))
      return "Carnauba Wax, Panthenol, Iron Oxides, Castor Oil";
    return "Aqua, Glycerin, Tocopherol, Natural Extracts";
  };
  const roundToRupee = (paise: number) => Math.round(paise / 100) * 100;
  const stockStatuses = [
    "IN_STOCK",
    "BACKORDER",
    "IN_STOCK",
    "PREORDER",
    "IN_STOCK",
    "OUT_OF_STOCK",
  ] as const;

  const seededProducts = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      brand: true,
      variants: { include: { images: true }, orderBy: { createdAt: "asc" } },
      categories: { include: { category: true } },
    },
  });

  for (const [i, product] of seededProducts.entries()) {
    const primaryImage =
      product.variants[0]?.images.find((img) => img.isPrimary)?.url ??
      pickImage(i, product.name);
    const variantTags = Array.from(
      new Set(product.variants.flatMap((v) => v.tags)),
    );
    const brandName = product.brand?.name ?? "Pinak";

    await prisma.product.update({
      where: { id: product.id },
      data: {
        keyIngredients: ingredientsFor(product.name),
        metaTitle: `${product.name} | ${brandName} | Pinak`,
        metaDescription:
          `Shop ${product.name} by ${brandName}. ${product.description ?? ""}`
            .trim()
            .slice(0, 160),
        metaKeywords: [
          product.name.toLowerCase(),
          brandName.toLowerCase(),
          ...variantTags,
        ].join(", "),
        seoKeyword: product.slug,
        model: `PNK-${String(i + 1).padStart(3, "0")}`,
        ean: `8901234${String(100000 + i * 137).padStart(6, "0")}`,
        frontImageUrl: primaryImage,
        tags: Array.from(
          new Set([
            ...variantTags,
            brandName.toLowerCase().replace(/\s+/g, "-"),
          ]),
        ),
        requiresShipping: true,
        outOfStockStatus: stockStatuses[i % stockStatuses.length],
        sortOrder: i,
        viewCount: 120 + i * 37,
      },
    });

    // Secondary category: also list the product under its parent category
    const parentIds = product.categories
      .map((c) => c.category.parentId)
      .filter((id): id is string => Boolean(id));
    if (parentIds.length) {
      await prisma.productCategory.createMany({
        data: parentIds.map((categoryId) => ({
          productId: product.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    for (const [j, variant] of product.variants.entries()) {
      const isLastVariant = j === product.variants.length - 1;
      const onSale = (i + j) % 2 === 0;
      const hasCompare = !onSale && i % 3 === 0;
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          ean: `8909876${String(100000 + i * 53 + j).padStart(6, "0")}`,
          sellingPrice: onSale ? roundToRupee(variant.price * 0.85) : null,
          comparePrice: hasCompare ? roundToRupee(variant.price * 1.2) : null,
          // Weight/size normally come from the Size option value; one variant overrides to show it
          ...(i === 0 && j === 0
            ? {
                weightGrams: 135,
                weightClassId: gramId,
                dimensionLength: 48,
                dimensionWidth: 48,
                dimensionHeight: 118,
                lengthClassId: mmId,
              }
            : {}),
          // A variant that overrides its product's tax class (shows the per-variant tax option)
          ...(i === 3 && j === 1 && taxClassMap["GST 5%"]
            ? { taxClassId: taxClassMap["GST 5%"].id }
            : {}),
          // Stock edge cases for the inventory / alerts screens
          ...(i === 0 && isLastVariant ? { stock: 0 } : {}),
          ...(i === 1 && isLastVariant ? { stock: 3 } : {}),
          ...(i === 2 && isLastVariant ? { stock: 7 } : {}),
          ...(i === 4 && isLastVariant && product.variants.length > 1
            ? { isActive: false }
            : {}),
        },
      });

      // Second gallery image per variant
      await prisma.productImage.create({
        data: {
          productVariantId: variant.id,
          url: pickImage(imageCounter++, `${product.name} 2`),
          altText: `${product.name} — alternate view`,
          isPrimary: false,
          sortOrder: 1,
        },
      });
    }
  }
  console.log(
    "✅ Enriched products & variants (SEO, pricing, dimensions, images, finish option)",
  );

  // Products in the other lifecycle states the admin UI filters on
  const catForExtras = await prisma.category.findFirst({
    where: { slug: "lipstick" },
  });
  const catForSkin = await prisma.category.findFirst({
    where: { slug: "serums" },
  });
  const extraProducts = [
    {
      name: "Rose Petal Lip Balm",
      slug: "rose-petal-lip-balm",
      brand: "LipLux",
      state: "Pending verification (inactive import)",
      isActive: false,
      isDeleted: false,
      outOfStockStatus: "IN_STOCK" as const,
      categoryId: catForExtras?.id,
      tax: "GST 18%",
      tags: ["HSN:3304", "imported", "lip-care"],
      variants: [{ sku: "RPLB-001", price: 19900, stock: 40 }],
    },
    {
      name: "Imported Hand Cream",
      slug: "imported-hand-cream",
      brand: "SkinCare Plus",
      state: "Pending verification (inactive import)",
      isActive: false,
      isDeleted: false,
      outOfStockStatus: "IN_STOCK" as const,
      categoryId: catForSkin?.id,
      tax: "GST 18%",
      tags: ["HSN:3304", "imported", "hand-care"],
      variants: [
        { sku: "IHC-001", price: 24900, stock: 25, size: "50ml" },
        { sku: "IHC-002", price: 39900, stock: 10, size: "100ml" },
      ],
    },
    {
      name: "Kohl Kajal Pencil (Discontinued)",
      slug: "kohl-kajal-pencil",
      brand: "EyeGlow",
      state: "Archived / soft-deleted",
      isActive: false,
      isDeleted: true,
      outOfStockStatus: "OUT_OF_STOCK" as const,
      categoryId: catForExtras?.id,
      tax: "GST 12%",
      tags: ["discontinued", "eyes"],
      variants: [{ sku: "KKP-001", price: 14900, stock: 0 }],
    },
    {
      name: "Holiday Glow Palette (Pre-order)",
      slug: "holiday-glow-palette",
      brand: "GlowBeauty",
      state: "Pre-order",
      isActive: true,
      isDeleted: false,
      outOfStockStatus: "PREORDER" as const,
      categoryId: catForExtras?.id,
      tax: "GST 28%",
      tags: ["limited-edition", "holiday", "palette"],
      variants: [{ sku: "HGP-001", price: 249900, stock: 0 }],
    },
    {
      name: "Travel Mini Serum (Sold Out)",
      slug: "travel-mini-serum",
      brand: "SkinCare Plus",
      state: "Out of stock",
      isActive: true,
      isDeleted: false,
      outOfStockStatus: "OUT_OF_STOCK" as const,
      categoryId: catForSkin?.id,
      tax: "GST 18%",
      tags: ["travel", "serum"],
      variants: [{ sku: "TMS-001", price: 34900, stock: 0 }],
    },
  ];
  for (const [i, def] of extraProducts.entries()) {
    const product = await prisma.product.create({
      data: {
        name: def.name,
        slug: def.slug,
        description: `${def.name} — ${def.state}.`,
        keyIngredients: ingredientsFor(def.name),
        metaTitle: `${def.name} | Pinak`,
        metaDescription: `${def.name} from ${def.brand}.`,
        metaKeywords: def.tags.join(", "),
        seoKeyword: def.slug,
        model: `PNK-X${String(i + 1).padStart(2, "0")}`,
        ean: `8905555${String(100000 + i).padStart(6, "0")}`,
        frontImageUrl: pickImage(imageCounter + i, def.name),
        tags: def.tags,
        brandId: brandMap[def.brand]?.id,
        taxClassId: taxClassMap[def.tax]?.id,
        weightClassId: gramId,
        lengthClassId: mmId,
        weightGrams: 25,
        outOfStockStatus: def.outOfStockStatus,
        isActive: def.isActive,
        isDeleted: def.isDeleted,
        sortOrder: 100 + i,
        viewCount: 20 + i * 11,
        ...(def.categoryId
          ? { categories: { create: [{ categoryId: def.categoryId }] } }
          : {}),
      },
    });
    createdProducts.push({ id: product.id, slug: product.slug });
    for (const v of def.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          price: v.price,
          sellingPrice: v.price > 30000 ? roundToRupee(v.price * 0.9) : null,
          stock: v.stock,
          weightGrams: 25,
          weightClassId: gramId,
          tags: def.tags,
          isActive: def.isActive,
          isDeleted: def.isDeleted,
        },
      });
      createdVariants.push({ id: variant.id, sku: v.sku, price: v.price });
      // Variants of one product must differ by an option, or shoppers cannot tell them apart
      const sizeValue = (v as { size?: string }).size;
      if (sizeValue && optionValueMap.Size?.[sizeValue]) {
        await prisma.variantOptionValue.create({
          data: {
            variantId: variant.id,
            optionValueId: optionValueMap.Size[sizeValue].id,
          },
        });
      }
      await prisma.productImage.create({
        data: {
          productVariantId: variant.id,
          url: pickImage(imageCounter++, def.name),
          altText: def.name,
          isPrimary: true,
        },
      });
    }
  }
  console.log(
    `✅ Created ${extraProducts.length} extra products (inactive / archived / pre-order / sold out)`,
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

  try {
    await prisma.featuredSectionImage.create({
      data: {
        featuredSectionId: sectionHero.id,
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgdhlMGc4OQ2oy4ze8gfCY4wYUcajDX1_LT-a1KXKF0Gt5RPFV21noNxkXgydtab-3uMflTDWNsnULfJhICLNSfVxv_S64okiaJKmyvoH3eAM6S_msRDL7tnC1P87gHWt7Gfyfh9E2tS3XqQ1_89cOqGi0uzIeBSPFIQKhHsl-YAC_aCdeoYdQzor-g3kE01wZ6q9a1dvMUNRi-vTPA5tsyPkoC7lgtiKYmlh6V0DDO2y4wZ14FevFS1cqgzYHX7CPOVSys3fnT_g",
        altText: "Homepage Hero Banner image",
        isPrimary: true,
        sortOrder: 0,
      },
    });
    await prisma.featuredSectionImage.create({
      data: {
        featuredSectionId: sectionExpertPicks.id,
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_j8yD9DHW29mHnnddf_ulUuyvgRSlVpd7WOvHqGzyrI2P0WjITqrHksEYsluf9wuc50_DDVGm7Y92OFIc_nh4ul5cddIS7BVPwYwTlDoEjb9WG7JxzXuJiSyB7mOVXnxDVVfoMBthI3A00RrHKxUemB6OauNwcgYlIAcAbA_S4XCU2rs4LPGxRvSHTBzpVo-Cahzif-q28vx9eRzuvD446uP7ykBD_wH5LNioMbgOtU8zIqhyfiYn2KoW_LrhR19GjAnr1vXal40",
        altText: "Beauty Expert Picks banner",
        isPrimary: true,
        sortOrder: 0,
      },
    });
  } catch (err: any) {
    console.warn(
      "⚠️  Skipping seeding featured section images:",
      err?.message ?? err,
    );
  }

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
  // Every seeded account can log in with this password (local/staging testing only).
  const SEED_PASSWORD = "Test@1234";
  const PASSWORD_HASH = await Passwordhasher.hashPassword(SEED_PASSWORD);

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
    {
      email: "priya.sharma@example.com",
      username: "priyas",
      name: "Priya Sharma",
      role: "USER" as const,
      isEmailVerified: true,
    },
    {
      email: "inactive.user@example.com",
      username: "inactiveuser",
      name: "Inactive User",
      role: "USER" as const,
      isEmailVerified: true,
      status: "INACTIVE" as const,
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
        hashPassword: PASSWORD_HASH,
        status:
          (u as { status?: "ACTIVE" | "INACTIVE" | "DELETED" }).status ??
          "ACTIVE",
      },
    });
    createdUsers[u.username] = created;
  }
  console.log(
    `✅ Created ${usersData.length} users (admin, moderator, ${usersData.length - 2} regular)`,
  );

  // Addresses (needed for checkout), including a default + secondary per customer
  const addressesByUser: Record<
    string,
    Array<{
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
      label: string;
      isDefault: boolean;
    }>
  > = {
    johndoe: [
      {
        fullName: "John Doe",
        addressLine1: "12, Linking Road",
        addressLine2: "Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
        phone: "9820012345",
        label: "Home",
        isDefault: true,
      },
      {
        fullName: "John Doe",
        addressLine1: "Tower B, Lower Parel",
        addressLine2: "Kamala Mills",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400013",
        phone: "9820012345",
        label: "Work",
        isDefault: false,
      },
    ],
    janesmith: [
      {
        fullName: "Jane Smith",
        addressLine1: "45, MG Road",
        addressLine2: "Near Metro Station",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        phone: "9845098450",
        label: "Home",
        isDefault: true,
      },
      {
        fullName: "Jane Smith",
        addressLine1: "7, Park Street",
        city: "Kolkata",
        state: "West Bengal",
        pincode: "700016",
        phone: "9830098300",
        label: "Parents",
        isDefault: false,
      },
    ],
    mikej: [
      {
        fullName: "Mike Johnson",
        addressLine1: "221, Sector 18",
        city: "Noida",
        state: "Uttar Pradesh",
        pincode: "201301",
        phone: "9811122233",
        label: "Home",
        isDefault: true,
      },
    ],
    sarahw: [
      {
        fullName: "Sarah Wilson",
        addressLine1: "9, Jubilee Hills Road No. 36",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500033",
        phone: "9900011122",
        label: "Home",
        isDefault: true,
      },
      {
        fullName: "Sarah Wilson",
        addressLine1: "18, Anna Salai",
        addressLine2: "Teynampet",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600018",
        phone: "9900033344",
        label: "Office",
        isDefault: false,
      },
    ],
    priyas: [
      {
        fullName: "Priya Sharma",
        addressLine1: "B-14, Vasant Vihar",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110057",
        phone: "9899988776",
        label: "Home",
        isDefault: true,
      },
    ],
  };
  const seededAddresses: Record<string, { id: string }[]> = {};
  for (const [username, list] of Object.entries(addressesByUser)) {
    const user = createdUsers[username];
    if (!user) continue;
    seededAddresses[username] = [];
    for (const a of list) {
      seededAddresses[username].push(
        await prisma.address.create({ data: { ...a, userId: user.id } }),
      );
    }
  }
  console.log("✅ Created customer addresses");

  // Google sign-in linked account (exercises the AuthProvider relation)
  if (createdUsers["priyas"]) {
    await prisma.authProvider.create({
      data: {
        userId: createdUsers["priyas"].id,
        provider: "GOOGLE",
        providerId: "seed-google-priya-sharma-0001",
      },
    });
  }

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
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB_j8yD9DHW29mHnnddf_ulUuyvgRSlVpd7WOvHqGzyrI2P0WjITqrHksEYsluf9wuc50_DDVGm7Y92OFIc_nh4ul5cddIS7BVPwYwTlDoEjb9WG7JxzXuJiSyB7mOVXnxDVVfoMBthI3A00RrHKxUemB6OauNwcgYlIAcAbA_S4XCU2rs4LPGxRvSHTBzpVo-Cahzif-q28vx9eRzuvD446uP7ykBD_wH5LNioMbgOtU8zIqhyfiYn2KoW_LrhR19GjAnr1vXal40",
      pricingStrategy: "FIXED_PRICE" as const,
      discountType: "PERCENTAGE" as const,
      discountValue: 15,
      tags: ["starter", "makeup", "bestseller"],
      sortOrder: 1,
      viewCount: 250,
      purchasedCount: 14,
      isActive: true,
      items: [
        { sku: "RGF-001-30", quantity: 1, isRequired: true },
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
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCaWD1o8rPaCqIIYQWiyXek5dflUIWwfu6alVBAeo0r6QVpEG7jzDoMw5TpEKblRFcGlCon95s1pf7cP98rOJ8AA0NlzPON01ri8pESYrpFecC0Lzh57MQdB5WqQgBq1GbkWmlHhqtE4KLcrhzJBj7q4f32RqIb3T7MdYVfBy2oz9_aaJrFAMEqrprMWu9KnXAri3Yp_UngO-vqO6Mf2IjfQawRxBe-6Nh_xeZGsgWQYM1Y402abel6RJYRZAoJtfhsrC7BP_W-Bm8",
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
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDXyLARo_crd7_eX9zhZBJa2Qpc5zunXEYVYSk2oNdSe3Tvch0tLSEQ6yNMoP8qOssEfwRn96shGGxdUOoOAPM4sbYXgHEz3scw_OjkMqN2j6-Li2Qg2S7YhH5YEXgR38Bx4cvSZGXDl3u59gvGCqg5xsu-4w7UANueDQmTXenFzFKdqlOkEnizufdBS7hN7Tj2Dnofqb9dR4hCRfqiushIcq5KjUAbYHx3JgxMHoei2ZUuYEswHFYfRcINd0xWJiAQXnMpt9A0mgw",
      pricingStrategy: "DYNAMIC" as const,
      discountType: "FIXED_AMOUNT" as const,
      discountValue: 30000,
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
      discountValue: 1200,
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
    if (def.imageUrl) {
      try {
        await prisma.comboKitImage.create({
          data: {
            comboKitId: kit.id,
            url: def.imageUrl,
            altText: `${def.name} primary image`,
            isPrimary: true,
            sortOrder: 0,
          },
        });
      } catch (err: any) {
        // Ignore if table missing
      }
    }
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

    if (skuToVariant["RGF-001-30"]?.id) {
      wishlistCreateItems.push({
        productVariantId: skuToVariant["RGF-001-30"].id,
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
        minOderValue: 100000,
        maxDiscountValue: 50000,
        validFrom: now,
        validUntil: in6Months,
        maxTotalUsers: 1000,
        maxUsesPerUser: 1,
        isActive: true,
      },
      {
        code: "FLAT200",
        discountType: "FLAT",
        discountValue: 20000,
        minOderValue: 200000,
        validFrom: now,
        validUntil: in6Months,
        maxUsesPerUser: 2,
        isActive: true,
      },
      {
        code: "SKINCARE15",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOderValue: 300000,
        maxDiscountValue: 75000,
        validFrom: now,
        validUntil: in6Months,
        isActive: true,
      },
    ],
  });
  // Lifecycle variety for the admin coupon screen: expired, inactive, trashed, nearly used up
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await prisma.coupon.createMany({
    data: [
      {
        code: "EXPIRED20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOderValue: 50000,
        maxDiscountValue: 40000,
        validFrom: twoMonthsAgo,
        validUntil: lastMonth,
        isActive: true,
      },
      {
        code: "PAUSED25",
        discountType: "PERCENTAGE",
        discountValue: 25,
        minOderValue: 150000,
        maxDiscountValue: 100000,
        validFrom: now,
        validUntil: in6Months,
        maxTotalUsers: 50,
        maxUsesPerUser: 1,
        isActive: false,
      },
      {
        code: "LASTONE50",
        discountType: "FLAT",
        discountValue: 5000,
        validFrom: now,
        validUntil: nextWeek,
        maxTotalUsers: 1,
        maxUsesPerUser: 1,
        isActive: true,
      },
      {
        code: "OLDPROMO",
        discountType: "FLAT",
        discountValue: 10000,
        minOderValue: 100000,
        validFrom: twoMonthsAgo,
        validUntil: in6Months,
        isActive: false,
        isDeleted: true,
      },
    ],
  });
  console.log(
    "✅ Created 7 coupons (3 live, 1 expired, 1 paused, 1 single-use, 1 trashed)",
  );

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

  const rgf001 = skuToVariant["RGF-001-30"];
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
        productId: await productIdBySku("RGF-001-30"),
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
        productName: "Soothing Eye Palette — Rose Naturals",
        price: sep001.price,
        quantity: 1,
      },
    ],
  });

  // --- Historical Orders for Best-Sellers Timeframe Testing ---
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 10); // > 1 week, < 1 month

  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 40); // > 1 month

  const testOrder1 = await prisma.order.create({
    data: {
      userId: johnId,
      status: "DELIVERED",
      paymentStatus: "COMPLETED",
      subtotalAmount: rgf001.price * 5,
      taxAmount: Math.round(rgf001.price * 5 * 0.12),
      shippingAmount: 0,
      totalAmount: Math.round(rgf001.price * 5 * 1.12),
      createdAt: oneWeekAgo,
    },
  });
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: testOrder1.id,
        productId: await productIdBySku("RGF-001-30"),
        productVariantId: rgf001.id,
        productName: "Radiant Glow Foundation — Light Beige 30ml",
        price: rgf001.price,
        quantity: 5,
        createdAt: oneWeekAgo,
      },
    ],
  });

  const testOrder2 = await prisma.order.create({
    data: {
      userId: janeId,
      status: "DELIVERED",
      paymentStatus: "COMPLETED",
      subtotalAmount: vml001.price * 10,
      taxAmount: Math.round(vml001.price * 10 * 0.12),
      shippingAmount: 0,
      totalAmount: Math.round(vml001.price * 10 * 1.12),
      createdAt: oneMonthAgo,
    },
  });
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: testOrder2.id,
        productId: await productIdBySku("VML-001"),
        productVariantId: vml001.id,
        productName: "Velvet Matte Lipstick — Classic Red",
        price: vml001.price,
        quantity: 10,
        createdAt: oneMonthAgo,
      },
    ],
  });
  // -----------------------------------------------------------

  console.log("✅ Created 3 orders (DELIVERED, PROCESSING, SHIPPED)");

  // -------------------------------------------------------------------------
  // 11.1 More orders (pending / cancelled) + enrich all orders with GST,
  //      addresses, invoices, gateway/payment data and coupon usage
  // -------------------------------------------------------------------------
  const priyaId = createdUsers["priyas"]?.id;
  const extraOrderDefs: Array<{
    userId: string | undefined;
    status: "PENDING" | "CANCELLED";
    paymentStatus: "PENDING" | "FAILED";
    sku: string;
    quantity: number;
  }> = [
    {
      userId: priyaId,
      status: "PENDING",
      paymentStatus: "PENDING",
      sku: "HFM-001",
      quantity: 1,
    },
    {
      userId: janeId,
      status: "CANCELLED",
      paymentStatus: "FAILED",
      sku: "VML-001",
      quantity: 2,
    },
  ];
  for (const def of extraOrderDefs) {
    const variant = skuToVariant[def.sku];
    if (!def.userId || !variant) continue;
    const subtotal = variant.price * def.quantity;
    const order = await prisma.order.create({
      data: {
        userId: def.userId,
        status: def.status,
        paymentStatus: def.paymentStatus,
        subtotalAmount: subtotal,
        taxAmount: Math.round(subtotal * 0.18),
        shippingAmount: 10000,
        totalAmount: subtotal + Math.round(subtotal * 0.18) + 10000,
      },
    });
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: await productIdBySku(def.sku),
        productVariantId: variant.id,
        productName: def.sku,
        price: variant.price,
        quantity: def.quantity,
      },
    });
  }

  const fyStart =
    now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const invoicePrefix = `INV/${fyStart}-${String(fyStart + 1).slice(-2)}/`;
  const paymentMethods = ["upi", "card", "netbanking", "wallet"];
  const welcomeCoupon = await prisma.coupon.findFirst({
    where: { code: "WELCOME10" },
  });
  const ordersToEnrich = await prisma.order.findMany({
    orderBy: { createdAt: "asc" },
    include: { items: true, user: { select: { username: true } } },
  });

  let invoiceSeq = 0;
  let couponApplied = false;
  for (const [index, order] of ordersToEnrich.entries()) {
    const shippingAddress = seededAddresses[order.user.username]?.[0]
      ? await prisma.address.findUnique({
          where: { id: seededAddresses[order.user.username][0].id },
        })
      : null;
    const addressSnapshot = shippingAddress
      ? {
          fullName: shippingAddress.fullName,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          phone: shippingAddress.phone,
        }
      : null;

    // First delivered order uses a coupon so CouponUsage / discounts are exercised
    const useCoupon =
      !couponApplied && welcomeCoupon && order.status === "DELIVERED";
    const discount = useCoupon
      ? Math.min(Math.floor((order.subtotalAmount * 10) / 100), 50000)
      : 0;
    if (useCoupon) couponApplied = true;

    const shipping = order.shippingAmount > 0 ? 10000 : 0;
    const netSubtotal = Math.max(0, order.subtotalAmount - discount);
    const gstPercentage =
      netSubtotal > 0
        ? Number(((order.taxAmount / netSubtotal) * 100).toFixed(2))
        : 0;
    const total = netSubtotal + order.taxAmount + shipping;

    // Item snapshots in the same shape order.service writes at checkout
    for (const item of order.items) {
      if (item.productVariantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: {
            optionValues: {
              include: { optionValue: { include: { option: true } } },
            },
          },
        });
        if (!variant) continue;
        const taxRate = gstPercentage;
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            variantDetails: {
              itemType: "PRODUCT_VARIANT",
              sku: variant.sku,
              ean: variant.ean,
              tags: variant.tags,
              price: variant.price,
              basePrice: variant.price,
              priceWithTax:
                variant.price + Math.round((variant.price * taxRate) / 100),
              sellingPrice: variant.sellingPrice,
              sellingPriceWithTax:
                variant.sellingPrice != null
                  ? variant.sellingPrice +
                    Math.round((variant.sellingPrice * taxRate) / 100)
                  : null,
              taxRate,
              optionValues: variant.optionValues.map((ov) => ({
                optionName: ov.optionValue.option.name,
                valueName: ov.optionValue.value,
              })),
            },
          },
        });
      } else if (item.comboKitId) {
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            variantDetails: {
              itemType: "COMBO_KIT",
              price: item.price,
              basePrice: item.price,
              priceWithTax:
                item.price + Math.round((item.price * gstPercentage) / 100),
              sellingPrice: null,
              sellingPriceWithTax: null,
              taxRate: gstPercentage,
            },
          },
        });
      }
    }

    const isPaid = order.paymentStatus === "COMPLETED";
    const hasGatewayOrder =
      order.paymentStatus !== "PENDING" || order.status === "PENDING";
    const suffix = order.id.slice(-10);
    const invoiceNumber = isPaid
      ? `${invoicePrefix}${String(++invoiceSeq).padStart(5, "0")}`
      : null;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        discountAmount: discount,
        couponcode: useCoupon ? "WELCOME10" : null,
        couponDiscount: discount,
        shippingAmount: shipping,
        totalAmount: total,
        gstPercentage,
        gstNumber: index === 0 ? "27ABCDE1234F1Z5" : null, // one B2B order
        invoiceNumber,
        invoiceDate: invoiceNumber ? order.createdAt : null,
        gatewayOrderId: hasGatewayOrder ? `order_seed_${suffix}` : null,
        gatewayPaymentId: isPaid ? `pay_seed_${suffix}` : null,
        gatewaySignature: isPaid ? `seedsig${suffix}`.padEnd(64, "0") : null,
        paymentMethod: isPaid
          ? paymentMethods[index % paymentMethods.length]
          : null,
        getBreakup: {
          taxBreakdown: order.items.map((item) => ({
            rate: gstPercentage,
            taxableValue: item.price * item.quantity,
            discountAmount: 0,
            amount: Math.round(
              (item.price * item.quantity * gstPercentage) / 100,
            ),
          })),
          shippingAddress: addressSnapshot,
          billingAddress: addressSnapshot,
          ...(isPaid
            ? {
                payment: {
                  paymentId: `pay_seed_${suffix}`,
                  status: "SUCCESS",
                  updatedAt: order.createdAt.toISOString(),
                },
              }
            : {}),
          ...(order.paymentStatus === "FAILED"
            ? {
                paymentFailure: {
                  reason: "Payment declined by bank",
                  updatedAt: order.createdAt.toISOString(),
                },
              }
            : {}),
          ...(order.status === "PENDING"
            ? {
                reservationExpiresAt: new Date(
                  Date.now() + 15 * 60 * 1000,
                ).toISOString(),
              }
            : {}),
        },
      },
    });

    if (useCoupon && welcomeCoupon) {
      await prisma.couponUsage.create({
        data: {
          couponId: welcomeCoupon.id,
          userId: order.userId,
          oderId: order.id,
          discountAmount: discount,
        },
      });
    }
  }
  console.log(
    `✅ Enriched ${ordersToEnrich.length} orders (GST, addresses, invoices, gateway data, coupon usage)`,
  );

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
  // 17. Dynamic Assets
  // -------------------------------------------------------------------------
  const dynamicAssets = [
    {
      slug: "mobile-home-banner-top",
      url: "https://placehold.co/1200x400/FF6B6B/FFFFFF/png?text=Home+Banner",
      type: "IMAGE" as const,
      title: "Mobile Home Banner (Top)",
      description:
        "The hero banner displayed at the top of the mobile home screen",
      metadata: { linkUrl: "/products", aspectRatio: "3:1" },
    },
    {
      slug: "mobile-home-banner-bottom",
      url: "https://placehold.co/1200x400/4ECDC4/FFFFFF/png?text=Bottom+Banner",
      type: "IMAGE" as const,
      title: "Mobile Home Banner (Bottom)",
      description:
        "The secondary banner displayed near the bottom of the mobile home screen",
      metadata: { linkUrl: "/combo-kits", aspectRatio: "3:1" },
    },
    {
      slug: "web-hero-slider-1",
      url: "https://placehold.co/1920x600/556270/FFFFFF/png?text=Hero+Slide+1",
      type: "IMAGE" as const,
      title: "Website Hero Slider — Slide 1",
      description: "First slide in the website hero carousel",
      metadata: { linkUrl: "/new-arrivals", buttonText: "Shop Now" },
    },
    {
      slug: "web-hero-slider-2",
      url: "https://placehold.co/1920x600/C7F464/333333/png?text=Hero+Slide+2",
      type: "IMAGE" as const,
      title: "Website Hero Slider — Slide 2",
      description: "Second slide in the website hero carousel",
      metadata: { linkUrl: "/deals", buttonText: "View Deals" },
    },
    {
      slug: "app-splash-screen",
      url: "https://placehold.co/1080x1920/2C3E50/FFFFFF/png?text=Splash",
      type: "IMAGE" as const,
      title: "Mobile App Splash Screen",
      description: "Splash/loading screen shown when the mobile app launches",
    },
    {
      slug: "checkout-promo-banner",
      url: "https://placehold.co/800x200/E74C3C/FFFFFF/png?text=Free+Shipping",
      type: "IMAGE" as const,
      title: "Checkout Promo Banner",
      description: "Promotional banner shown on the checkout page",
      metadata: { linkUrl: "/coupons", promoCode: "FREESHIP" },
    },
  ];

  try {
    for (const asset of dynamicAssets) {
      await prisma.dynamicAsset.upsert({
        where: { slug: asset.slug },
        update: {},
        create: asset,
      });
    }
    console.log(`✅ Seeded ${dynamicAssets.length} dynamic assets`);
  } catch (err: any) {
    console.warn("⚠️  Skipping seeding dynamic assets:", err?.message ?? err);
  }

  // -------------------------------------------------------------------------
  // 18. Audit log + static pages & settings
  // -------------------------------------------------------------------------
  const adminForAudit = createdUsers["admin"];
  const moderatorForAudit = createdUsers["moderator"];
  if (adminForAudit && moderatorForAudit) {
    const firstProduct = createdProducts[0];
    const firstOrder = ordersToEnrich[0];
    const auditEntries = [
      firstProduct && {
        entity: "Product",
        entityId: firstProduct.id,
        action: "UPDATE",
        before: { isActive: false },
        after: { isActive: true },
        actorId: adminForAudit.id,
        actorRole: "ADMIN",
        source: "Admin Panel",
      },
      firstProduct && {
        entity: "Product",
        entityId: firstProduct.id,
        action: "UPDATE",
        before: { stock: 30 },
        after: { stock: 25 },
        actorId: moderatorForAudit.id,
        actorRole: "MODERATOR",
        source: "Admin Panel",
      },
      firstOrder && {
        entity: "Order",
        entityId: firstOrder.id,
        action: "UPDATE",
        before: { status: "PROCESSING" },
        after: { status: "DELIVERED" },
        actorId: adminForAudit.id,
        actorRole: "ADMIN",
        source: "Admin Panel",
      },
      {
        entity: "Coupon",
        entityId: "WELCOME10",
        action: "CREATE",
        before: null,
        after: { code: "WELCOME10", discountValue: 10 },
        actorId: adminForAudit.id,
        actorRole: "ADMIN",
        source: "API",
      },
      {
        entity: "Product",
        entityId: "bulk-import",
        action: "CREATE",
        before: null,
        after: { imported: 2, status: "inactive" },
        actorId: adminForAudit.id,
        actorRole: "ADMIN",
        source: "Admin Panel",
      },
      {
        entity: "Order",
        entityId: "cron-reservation-cleanup",
        action: "UPDATE",
        before: null,
        after: { releasedReservations: 0 },
        actorId: null,
        actorRole: "SYSTEM",
        source: "cron",
      },
    ].filter(Boolean) as Array<{
      entity: string;
      entityId: string;
      action: string;
      before: object | null;
      after: object | null;
      actorId: string | null;
      actorRole: string;
      source: string;
    }>;
    for (const entry of auditEntries) {
      await prisma.auditLog.create({
        data: {
          entity: entry.entity,
          entityId: entry.entityId,
          action: entry.action,
          ...(entry.before ? { before: entry.before } : {}),
          ...(entry.after ? { after: entry.after } : {}),
          actorId: entry.actorId,
          actorRole: entry.actorRole,
          source: entry.source,
        },
      });
    }
    console.log(`✅ Created ${auditEntries.length} audit log entries`);
  }

  await prisma.page.createMany({ data: defaultPages });
  await prisma.setting.createMany({ data: defaultSettings });
  console.log(
    `✅ Created ${defaultPages.length} static pages & ${defaultSettings.length} settings`,
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
  - 7 coupons · 7 orders · 6 reviews · 3 articles · 3 stores · audit logs · static pages & settings
  - customer addresses, Google-linked user, inactive user
  - 3 quiz questions with options & rules
  - ${dynamicAssets.length} dynamic assets

🔑 Login (all seeded accounts): password '${SEED_PASSWORD}'
   admin@pinak.com · moderator@pinak.com · john.doe@example.com · jane.smith@example.com · priya.sharma@example.com
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
