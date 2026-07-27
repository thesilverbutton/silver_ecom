"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader, type UploadedImage } from "./image-uploader";
import { createProductAction, type CreateProductInput } from "@/actions/product";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
}

interface ProductFormProps {
  categories: Category[];
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_ART_FORMS = ["Type 1", "Type 2", "Type 3", "Customized"];

export function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [gender, setGender] = useState<"men" | "women" | "unisex">("men");

  // Pricing (in rupees, converted to paise on submit)
  const [basePrice, setBasePrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");

  // Images
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Attributes
  const [fabric, setFabric] = useState("");
  const [weave, setWeave] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [occasion, setOccasion] = useState("");
  const [fit, setFit] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [tags, setTags] = useState("");

  // Variants
  const [hasVariants, setHasVariants] = useState(true);
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [artForms, setArtForms] = useState<string[]>([]);
  const [stock, setStock] = useState("");
  const [variantStock, setVariantStock] = useState<Record<string, string>>({});

  // Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [status, setStatus] = useState<"draft" | "active" | "archived">("active");

  const toggleValue = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  // Build variant combinations (size × artForm)
  const buildCombos = (): { key: string; options: Record<string, string> }[] => {
    const sizeList = sizes.length > 0 ? sizes : [""];
    const artList = artForms.length > 0 ? artForms : [""];
    const combos: { key: string; options: Record<string, string> }[] = [];
    for (const s of sizeList) {
      for (const a of artList) {
        const options: Record<string, string> = {};
        if (s) options.size = s;
        if (a) options.artForm = a;
        if (Object.keys(options).length === 0) continue;
        combos.push({ key: `${s}__${a}`, options });
      }
    }
    return combos;
  };

  const combos = hasVariants ? buildCombos() : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }
    const priceNum = Math.round(parseFloat(basePrice) * 100);
    if (!priceNum || priceNum < 100) {
      setError("Enter a valid base price (min ₹1)");
      return;
    }

    // Build variants
    let variants: CreateProductInput["variants"] = [];
    if (hasVariants) {
      if (sizes.length === 0 && artForms.length === 0) {
        setError("Add at least one size or art form, or turn off variants");
        return;
      }
      const skuBase = title.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 12).replace(/-$/, "");
      variants = combos.map((c) => ({
        sku: `${skuBase}-${c.key.replace(/[^A-Za-z0-9]+/g, "").toUpperCase()}`,
        options: c.options,
        priceDelta: 0,
        stock: parseInt(variantStock[c.key] || "0", 10) || 0,
        isActive: true,
      }));
    }

    const payload: CreateProductInput = {
      title,
      description,
      shortDescription: shortDescription || undefined,
      categoryId,
      gender,
      images,
      basePrice: priceNum,
      compareAtPrice: compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : undefined,
      hasVariants,
      variants,
      stock: hasVariants ? 0 : parseInt(stock || "0", 10) || 0,
      fabric,
      weave: weave || undefined,
      color: color || undefined,
      pattern: pattern || undefined,
      occasion: occasion || undefined,
      fit: fit || undefined,
      careInstructions: careInstructions || undefined,
      madeIn: "India",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured,
      isBestSeller,
      isNewArrival,
      status,
    };

    startTransition(async () => {
      const result = await createProductAction(payload);
      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.error || "Failed to create product");
      }
    });
  };

  const inputClass = "w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "mb-1 block text-sm font-medium";
  // Only show categories for the selected gender (avoids duplicate names)
  const subCategories = categories.filter(
    (c) => c.parentId && (gender === "unisex" || c.slug.startsWith(`${gender}-`)),
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 pb-16">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div>
          <label className={labelClass}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required placeholder="e.g. Calligraphed Linen Shirt" />
        </div>
        <div>
          <label className={labelClass}>Short Description</label>
          <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} placeholder="One-line summary shown on PDP" />
        </div>
        <div>
          <label className={labelClass}>Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={4} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Category *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} required>
              <option value="">Select category</option>
              {subCategories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Gender *</label>
            <select value={gender} onChange={(e) => { setGender(e.target.value as typeof gender); setCategoryId(""); }} className={inputClass}>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Images</h2>
        <ImageUploader images={images} onChange={setImages} productTitle={title} />
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Base Price (₹) *</label>
            <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={inputClass} placeholder="4999" required min={1} />
          </div>
          <div>
            <label className={labelClass}>Compare-at Price (₹)</label>
            <input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className={inputClass} placeholder="5999 (optional)" />
          </div>
        </div>
      </section>

      {/* Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variants</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="h-4 w-4" />
            This product has variants
          </label>
        </div>

        {!hasVariants ? (
          <div>
            <label className={labelClass}>Stock *</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} placeholder="Available quantity" min={0} />
          </div>
        ) : (
          <>
            {/* Sizes */}
            <div>
              <label className={labelClass}>Sizes</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_SIZES.map((s) => (
                  <button key={s} type="button" onClick={() => toggleValue(sizes, setSizes, s)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${sizes.includes(s) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Art Forms */}
            <div>
              <label className={labelClass}>Art Form</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ART_FORMS.map((a) => (
                  <button key={a} type="button" onClick={() => toggleValue(artForms, setArtForms, a)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${artForms.includes(a) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Variant stock grid */}
            {combos.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Variant</th>
                      <th className="px-3 py-2 text-right font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {combos.map((c) => (
                      <tr key={c.key}>
                        <td className="px-3 py-2">{Object.values(c.options).join(" · ")}</td>
                        <td className="px-3 py-2 text-right">
                          <input type="number" min={0} value={variantStock[c.key] || ""}
                            onChange={(e) => setVariantStock((prev) => ({ ...prev, [c.key]: e.target.value }))}
                            className="w-20 rounded border px-2 py-1 text-right text-sm" placeholder="0" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* Attributes */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Product Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>Fabric *</label><input value={fabric} onChange={(e) => setFabric(e.target.value)} className={inputClass} placeholder="Handloom Linen" required /></div>
          <div><label className={labelClass}>Weave</label><input value={weave} onChange={(e) => setWeave(e.target.value)} className={inputClass} placeholder="Plain Weave" /></div>
          <div><label className={labelClass}>Color</label><input value={color} onChange={(e) => setColor(e.target.value)} className={inputClass} placeholder="Charcoal" /></div>
          <div><label className={labelClass}>Pattern</label><input value={pattern} onChange={(e) => setPattern(e.target.value)} className={inputClass} placeholder="Solid" /></div>
          <div><label className={labelClass}>Occasion</label><input value={occasion} onChange={(e) => setOccasion(e.target.value)} className={inputClass} placeholder="Casual / Festive" /></div>
          <div><label className={labelClass}>Fit</label><input value={fit} onChange={(e) => setFit(e.target.value)} className={inputClass} placeholder="Regular" /></div>
        </div>
        <div><label className={labelClass}>Care Instructions</label><textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} className={inputClass} rows={2} placeholder="Hand wash cold. Dry in shade." /></div>
        <div><label className={labelClass}>Tags (comma separated)</label><input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="linen, calligraphy, premium" /></div>
      </section>

      {/* Merchandising */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Merchandising</h2>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4" /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="h-4 w-4" /> Bestseller</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="h-4 w-4" /> New Arrival</label>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={`${inputClass} max-w-xs`}>
            <option value="active">Active (visible)</option>
            <option value="draft">Draft (hidden)</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {isPending ? "Creating..." : "Create Product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="rounded-lg border px-6 py-3 text-sm font-medium hover:bg-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
