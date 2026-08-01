import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const POLICIES: Record<string, { title: string; content: string }> = {
  shipping: {
    title: "Shipping Policy",
    content: `At The Silver Button, we strive to deliver your orders quickly and securely. We partner with India's most trusted courier services to ensure a seamless delivery experience.

ORDER PROCESSING
• All orders are processed and dispatched within 1–2 business days (excluding weekends and public holidays).
• In case of high order volumes, processing may take slightly longer. We will notify you of any significant delays.

SHIPPING RATES & DELIVERY
• Standard Shipping: Delivered within 5–7 business days.
• Express Shipping: Delivered within 2–3 business days (where available).
• Free standard shipping on all orders above ₹999.
• For orders below ₹999, standard shipping rates apply as calculated at checkout.

TRACKING YOUR ORDER
• Once your order is dispatched, you will receive an email confirmation containing your courier tracking number and a link to trace your package.

IMPORTANT CONSIDERATIONS
• We currently ship exclusively within India.
• Our courier partners will make up to three attempts to deliver your package before returning it to us.
• Please ensure your shipping address and contact number are accurate to avoid delays.

For any shipping-related queries, please contact our support team at orders@thesilverbutton.com.`,
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
    content: `At The Silver Button, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This policy outlines how we collect, use, and safeguard your data.

INFORMATION WE COLLECT
• We only collect essential information required to process your orders and provide a seamless shopping experience. This includes your name, email address, phone number, and shipping address.
• We do not collect or store your payment card details. All transactions are securely processed through our payment partner, Razorpay, using industry-standard encryption.

HOW WE USE YOUR DATA
• To process and fulfill your orders, including sending order confirmations and shipping updates.
• To communicate with you regarding your purchases or respond to customer service inquiries.
• To improve our website functionality and enhance your overall user experience.

DATA SHARING & SECURITY
• We respect your privacy and will never sell, rent, or trade your personal information to third parties for marketing purposes.
• Your data is only shared with trusted partners (such as courier services) strictly for the purpose of order fulfillment.

COOKIES
• We use cookies solely for essential site functionalities, such as maintaining your shopping cart and managing your active session. We do not use intrusive tracking cookies.

YOUR RIGHTS
• You have the right to request access to the personal data we hold about you.
• You may request the deletion or modification of your account and personal information at any time.

If you have any questions or concerns regarding our privacy practices, please contact us at orders@thesilverbutton.com.`,
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
