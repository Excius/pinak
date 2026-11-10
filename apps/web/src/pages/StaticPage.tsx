import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { getPageBySlug, type PublicPageDetail } from "../api/pages.api";

interface StaticPageProps {
  defaultSlug?: string;
}

const FALLBACK_PAGES: Record<string, Partial<PublicPageDetail>> = {
  "about-us": {
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
  },
  "privacy-policy": {
    title: "Privacy Policy",
    metaTitle: "Privacy Policy | Pinak Beauty",
    metaDescription:
      "Learn how Pinak Beauty protects and respects your personal data.",
    content: `# Privacy Policy

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

## Contact Us
If you have questions regarding this Privacy Policy, please email **support@pinak.com**.`,
  },
  "terms-and-conditions": {
    title: "Terms & Conditions",
    metaTitle: "Terms & Conditions | Pinak Beauty",
    metaDescription: "Terms governing the use of Pinak website and services.",
    content: `# Terms & Conditions

Welcome to Pinak Beauty. By accessing or using our website, you agree to comply with and be bound by the following terms.

## 1. General Conditions
We reserve the right to refuse service to anyone for any reason at any time. Prices for our products are subject to change without prior notice.

## 2. Products & Pricing
All product prices are quoted in Indian Rupees (₹) and include applicable taxes unless specified otherwise. We make every effort to display the colors and images of our products as accurately as possible.

## 3. Order Acceptance
Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to cancel or limit quantities on any order.

## 4. User Conduct
You agree not to reproduce, duplicate, copy, sell, or exploit any portion of the service or website content without express written permission from Pinak Beauty.`,
  },
  "shipping-policy": {
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
  },
  "return-refund-policy": {
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
  },
};

export const StaticPage: React.FC<StaticPageProps> = ({ defaultSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = defaultSlug || paramSlug || "";

  const [page, setPage] = useState<PublicPageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    getPageBySlug(slug)
      .then((data) => {
        setPage(data);
        updateMeta(data);
      })
      .catch((err) => {
        // Fallback to built-in default page if available
        if (FALLBACK_PAGES[slug]) {
          const fallback = {
            id: slug,
            slug,
            title: FALLBACK_PAGES[slug].title || "Page",
            content: FALLBACK_PAGES[slug].content || "",
            metaTitle: FALLBACK_PAGES[slug].metaTitle,
            metaDescription: FALLBACK_PAGES[slug].metaDescription,
            updatedAt: new Date().toISOString(),
          };
          setPage(fallback);
          updateMeta(fallback);
        } else {
          console.error("Failed to load page content", err);
          setError("Page not found or is currently unavailable.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const updateMeta = (data: Partial<PublicPageDetail>) => {
    if (data.metaTitle) {
      document.title = data.metaTitle;
    } else if (data.title) {
      document.title = `${data.title} | Pinak Beauty`;
    }

    if (data.metaDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", data.metaDescription);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col text-text-main-light">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted mb-8">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="material-icons-outlined text-xs text-primary/40">
            chevron_right
          </span>
          <span className="text-primary font-medium truncate">
            {loading ? "Loading..." : page?.title || "Legal & Policy"}
          </span>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-primary/10 rounded-lg w-2/3" />
            <div className="h-4 bg-primary/5 rounded w-1/4" />
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-primary/5 rounded w-full" />
              <div className="h-4 bg-primary/5 rounded w-5/6" />
              <div className="h-4 bg-primary/5 rounded w-4/6" />
              <div className="h-4 bg-primary/5 rounded w-full" />
            </div>
          </div>
        ) : error || !page ? (
          <div className="text-center py-20 px-4 bg-surface-dark/40 rounded-3xl border border-primary/10">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-outlined text-3xl text-primary">
                article
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-text-main-light mb-2">
              Page Not Found
            </h2>
            <p className="text-text-muted text-sm max-w-md mx-auto mb-8">
              {error ||
                "The page you are looking for doesn't exist or has been moved."}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-gradient text-background-main font-bold text-sm hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
            >
              <span className="material-icons-outlined text-sm">home</span>
              Return to Home
            </Link>
          </div>
        ) : (
          <article className="bg-surface-dark/40 rounded-3xl border border-primary/10 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-sm">
            {/* Page Header */}
            <header className="border-b border-primary/10 pb-6 mb-8">
              <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-gold-gradient mb-3">
                {page.title}
              </h1>
              {page.updatedAt && (
                <p className="text-xs text-text-muted">
                  Last updated:{" "}
                  {new Date(page.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </header>

            {/* Page Content */}
            <MarkdownRenderer content={page.content} />
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StaticPage;
