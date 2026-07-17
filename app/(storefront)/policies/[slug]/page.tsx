import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const POLICIES: Record<string, { title: string; content: string }> = {
  shipping: {
    title: "Shipping Policy",
    content: `We ship across India via trusted courier partners.

• Standard shipping: 5–7 business days
• Express shipping: 2–3 business days (where available)
• Free shipping on orders above ₹999
• Orders are processed within 1–2 business days
• You will receive a tracking link once your order ships

For any shipping queries, contact us at orders@thesilverbutton.com`,
  },
  returns: {
    title: "Returns & Refunds",
    content: `We want you to love what you buy. If something doesn't work out:

• Returns accepted within 7 days of delivery
• Items must be unworn, unwashed, with tags intact
• Initiate a return from your account or contact us
• Refunds are processed within 5–7 business days after we receive the return
• Original shipping charges are non-refundable

Custom-made or sale items are not eligible for returns.`,
  },
  privacy: {
    title: "Privacy Policy",
    content: `Your privacy matters to us.

• We collect only what's needed: name, email, phone, address for orders
• Payment is processed securely by Razorpay — we never see or store card details
• We don't sell or share your data with third parties
• Cookies are used only for essential site functionality (cart, session)
• You can request deletion of your account data anytime

For questions, email orders@thesilverbutton.com`,
  },
  terms: {
    title: "Terms & Conditions",
    content: `By using our website, you agree to these terms:

• All products are subject to availability
• Prices are in INR and inclusive of applicable taxes unless stated otherwise
• We reserve the right to cancel orders in case of stock errors or pricing mistakes
• Product images are representative; slight variations in handloom fabric are natural and not defects
• Your use of this site is governed by the laws of India

Last updated: July 2026`,
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) return { title: "Not Found" };
  return { title: policy.title };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: policy.title }]} />

      <Section as="div" className="py-8">
        <h1 className="text-2xl font-bold">{policy.title}</h1>
        <div className="mt-6 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {policy.content}
        </div>
      </Section>
    </Container>
  );
}
