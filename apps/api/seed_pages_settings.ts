import { prisma } from './src/lib/prisma.js';

const defaultPages = [
  {
    slug: 'about-us',
    title: 'About Us',
    metaTitle: 'About Us | Pinak Beauty',
    metaDescription: 'Discover our story, craftsmanship and mission rooted in Indian traditions.',
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
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | Pinak Beauty',
    metaDescription: 'Learn how Pinak Beauty protects and respects your personal data.',
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
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    metaTitle: 'Terms & Conditions | Pinak Beauty',
    metaDescription: 'Terms governing the use of Pinak website and services.',
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
    slug: 'shipping-policy',
    title: 'Shipping & Delivery Policy',
    metaTitle: 'Shipping & Delivery Policy | Pinak Beauty',
    metaDescription: 'Everything you need to know about our shipping rates and delivery timelines.',
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
    slug: 'return-refund-policy',
    title: 'Return & Refund Policy',
    metaTitle: 'Return & Refund Policy | Pinak Beauty',
    metaDescription: 'Our transparent 7-day return and hassle-free refund guidelines.',
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
    key: 'WHATSAPP_NUMBER',
    value: '+919876543210',
    group: 'contact',
    description: 'Customer support WhatsApp number for direct chat',
    isPublic: true,
  },
  {
    key: 'WHATSAPP_DEFAULT_MESSAGE',
    value: 'Hello! I would like to know more about Pinak products.',
    group: 'contact',
    description: 'Pre-filled WhatsApp greeting message',
    isPublic: true,
  },
  {
    key: 'SUPPORT_EMAIL',
    value: 'support@pinak.com',
    group: 'contact',
    description: 'Official customer support email',
    isPublic: true,
  },
  {
    key: 'SUPPORT_PHONE',
    value: '+919876543210',
    group: 'contact',
    description: 'Customer support phone number',
    isPublic: true,
  },
];

async function seed() {
  console.log('Seeding standard static pages...');
  for (const p of defaultPages) {
    const existing = await prisma.page.findFirst({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.page.create({ data: p });
      console.log(`Created page: ${p.title} (/pages/${p.slug})`);
    } else {
      console.log(`Page already exists: ${p.title} (/pages/${p.slug})`);
    }
  }

  console.log('Seeding default settings...');
  for (const s of defaultSettings) {
    const existing = await prisma.setting.findUnique({ where: { key: s.key } });
    if (!existing) {
      await prisma.setting.create({ data: s });
      console.log(`Created setting: ${s.key}`);
    } else {
      console.log(`Setting already exists: ${s.key}`);
    }
  }

  console.log('Seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
