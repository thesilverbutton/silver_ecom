import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with The Silver Button. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      <Section as="div" className="py-8">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold">Get in Touch</h1>
        <p className="mt-2 text-muted-foreground">
          Have a question about sizing, fabric, or an order? We&apos;re here to help.
        </p>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          {/* Contact form */}
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Order enquiry, sizing help, etc." className="mt-1" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="How can we help?" className="mt-1" rows={5} required />
            </div>
            {/* Honeypot for spam */}
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <Button type="submit" size="lg">
              Send Message
            </Button>
            <p className="text-xs text-muted-foreground">We typically respond within 24 hours.</p>
          </form>

          {/* Contact info */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <a href={`mailto:${siteConfig.contact.email}`} className="text-sm text-muted-foreground hover:text-foreground">
                  {siteConfig.contact.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Phone</p>
                <a href={`tel:${siteConfig.contact.phone}`} className="text-sm text-muted-foreground hover:text-foreground">
                  {siteConfig.contact.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">Faridabad, Haryana, India</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Container>
  );
}
