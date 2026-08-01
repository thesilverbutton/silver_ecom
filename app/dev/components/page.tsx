"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tag } from "@/components/ui/tag";
import { IconButton } from "@/components/ui/icon-button";
import { PriceTag } from "@/components/ui/price-tag";
import { RatingStars } from "@/components/ui/rating-stars";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGridSkeleton, PDPSkeleton, OrderListSkeleton, TableSkeleton } from "@/components/ui/skeletons";
import { ProductCard } from "@/components/product/product-card";
import { StatCard } from "@/components/admin/stat-card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EmptyState } from "@/components/layout/empty-state";
import { Section, Container } from "@/components/layout/section";
import { Heart, ShoppingBag, AlertCircle, CheckCircle, IndianRupee } from "lucide-react";

/**
 * DEV-ONLY component preview route.
 * Remove or protect before production (Phase 8).
 */
export default function ComponentsPreview() {
  return (
    <div className="min-h-screen">
      <Navbar cartCount={3} />

      <Container className="py-12">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl font-bold">Component Library</h1>
        <p className="mt-2 text-muted-foreground">Preview all UI primitives and feature components.</p>

        <Separator className="my-8" />

        {/* Buttons */}
        <PreviewSection title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="destructive">Destructive</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button size="icon"><Heart className="h-4 w-4" /></Button>
          </div>
        </PreviewSection>

        {/* IconButton */}
        <PreviewSection title="IconButton">
          <div className="flex gap-3">
            <IconButton label="Heart" size="sm"><Heart className="h-4 w-4" /></IconButton>
            <IconButton label="Cart" size="md"><ShoppingBag className="h-5 w-5" /></IconButton>
            <IconButton label="Large" size="lg"><Heart className="h-6 w-6" /></IconButton>
          </div>
        </PreviewSection>

        {/* Inputs */}
        <PreviewSection title="Inputs">
          <div className="grid max-w-md gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="you@example.com" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="error-input">With error</Label>
              <Input id="error-input" error placeholder="Invalid value" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="disabled-input">Disabled</Label>
              <Input id="disabled-input" disabled placeholder="Can't touch this" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="textarea">Message</Label>
              <Textarea id="textarea" placeholder="Write something..." className="mt-1" />
            </div>
          </div>
        </PreviewSection>

        {/* Badges & Tags */}
        <PreviewSection title="Badges & Tags">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="accent">Accent</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Tag>Silver</Tag>
            <Tag>Ring</Tag>
            <Tag onRemove={() => {}}>Removable</Tag>
          </div>
        </PreviewSection>

        {/* Price & Rating */}
        <PreviewSection title="Price & Rating">
          <div className="space-y-3">
            <PriceTag price={129900} size="lg" />
            <PriceTag price={89900} compareAtPrice={129900} size="md" />
            <PriceTag price={49900} size="sm" />
          </div>
          <div className="mt-4 space-y-2">
            <RatingStars rating={4.5} showValue />
            <RatingStars rating={3} size="lg" />
            <RatingStars rating={1.5} size="sm" />
          </div>
        </PreviewSection>

        {/* Breadcrumbs */}
        <PreviewSection title="Breadcrumbs">
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Rings", href: "/collections/rings" },
            { label: "Silver Band Ring" },
          ]} />
        </PreviewSection>

        {/* Progress */}
        <PreviewSection title="Progress">
          <div className="max-w-md space-y-4">
            <Progress value={25} />
            <Progress value={60} />
            <Progress value={100} />
          </div>
        </PreviewSection>

        {/* Alerts */}
        <PreviewSection title="Alerts">
          <div className="max-w-lg space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Default</AlertTitle>
              <AlertDescription>This is an informational alert.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Something went wrong.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Order placed successfully.</AlertDescription>
            </Alert>
          </div>
        </PreviewSection>

        {/* Cards */}
        <PreviewSection title="Card">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description text here.</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm">Some content inside the card.</p></CardContent>
              <CardFooter><Button size="sm">Action</Button></CardFooter>
            </Card>
            <StatCard title="Revenue" value="₹45,230" icon={<IndianRupee className="h-4 w-4" />} trend={{ value: 12, label: "vs last week" }} />
            <StatCard title="Orders" value="23" description="This month" trend={{ value: -5, label: "vs last month" }} />
          </div>
        </PreviewSection>

        {/* ProductCard */}
        <PreviewSection title="ProductCard">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <ProductCard
              slug="handloom-cotton-shirt"
              title="Handloom Cotton Shirt - Indigo"
              price={149900}
              compareAtPrice={199900}
              image={{ url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Shirt", alt: "Cotton shirt" }}
              isBestSeller
              fabric="Handloom Cotton"
            />
            <ProductCard
              slug="silk-saree-banarasi"
              title="Banarasi Silk Saree"
              price={389900}
              image={{ url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Saree", alt: "Saree" }}
              isNewArrival
              fabric="Pure Silk"
            />
            <ProductCard
              slug="linen-kurta-men"
              title="Linen Kurta — Natural"
              price={249900}
              image={{ url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Kurta", alt: "Kurta" }}
              isOutOfStock
              fabric="Linen"
            />
            <ProductCard
              slug="block-print-dupatta"
              title="Block Print Dupatta"
              price={69900}
              image={{ url: "https://placehold.co/400x533/e5e7eb/4b5563?text=Dupatta", alt: "Dupatta" }}
              fabric="Mul Cotton"
            />
          </div>
        </PreviewSection>

        {/* Empty State */}
        <PreviewSection title="EmptyState">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you haven't added any items yet."
            action={<Button>Start Shopping</Button>}
          />
        </PreviewSection>

        {/* Skeletons */}
        <PreviewSection title="Skeletons">
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-sm font-medium">Product Grid</p>
              <ProductGridSkeleton count={4} />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">PDP</p>
              <PDPSkeleton />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Order List</p>
              <OrderListSkeleton />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium">Table</p>
              <TableSkeleton />
            </div>
          </div>
        </PreviewSection>

        {/* Spinner & Skeleton basic */}
        <PreviewSection title="Spinner & Skeleton">
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </PreviewSection>
      </Container>

      <Footer />
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section as="div" className="py-8">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </Section>
  );
}
