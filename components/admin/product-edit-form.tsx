"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader, type UploadedImage } from "./image-uploader";
import { updateProductAction, type UpdateProductInput } from "@/actions/product-edit";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string;
}

interface ExistingProduct {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  gender: "men" | "women" | "unisex";
  images: UploadedImage[];
  basePrice: number;
  compareAtPrice?: number;
  hasVariants: boolean;
  variants: { sku: string; options: Record<string, string>; priceDelta: number; stock: number; isActive: boolean }[];
  stock: number;
  fabric: string;
  weave?: string;
  color?: string;
  pattern?: string;
  occasion?: string;
  fit?: string;
  careInstructions?: string;
  madeIn?: string;
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  status: "draft" | "active" | "archived";
}

interface Props {
  product: ExistingProduct;
  categories: Category[];
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_ART_FORMS = ["Type 1", "Type 2", "Type 3", "Customized"];

export function ProductEditForm({ product, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [shortDescription, setShortDescription] = useState(product.shortDescription || "");
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [gender, setGender] = useState(product.gender);
  const [basePrice, setBasePrice] = useState(String(product.basePrice / 100));
  const [compareAtPrice, setCompareAtPrice] = useState(product.compareAtPrice ? String(product.compareAtPrice / 100) : "");
  const [images, setImages] = useState<UploadedImage[]>(product.images);
  const [fabric, setFabric] = useState(product.fabric);
  const [weave, setWeave] = useState(product.weave || "");
  const [color, setColor] = useState(product.color || "");
  const [pattern, setPattern] = useState(product.pattern || "");
  const [occasion, setOccasion] = useState(product.occasion || "");
  const [fit, setFit] = useState(product.fit || "");
  const [careInstructions, setCareInstructions] = useState(product.careInstructions || "");
  const [tags, setTags] = useState(product.tags.join(", "));
  const [hasVariants, setHasVariants] = useState(product.hasVariants);
  const [stock, setStock] = useState(String(product.stock));
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [isBestSeller, setIsBestSeller] = useState(product.isBestSeller);
  const [isNewArrival, setIsNewArrival] = useState(product.isNewArrival);
  const [status, setStatus] = useState(product.status);

  // Extract existing sizes and artForms from variants
  const existingSizes = [...new Set(product.variants.map((v) => v.options.size).filter((s): s is string => !!s))];
  const existingArtForms = [...new Set(product.variants.map((v) => v.options.artForm).filter((a): a is string => !!a))];

  const [sizes, setSizes] = useState<string[]>(existingSizes.length > 0 ? existingSizes : ["S", "M", "L"]);
  const [artForms, setArtForms] = useState<string[]>(existingArtForms);

  // Build variant stock from existing
  const initVariantStock: Record<string, string> = {};
  for (const v of product.variants) {
    const key = `${v.options.size || ""}__${v.options.artForm || ""}`;
    initVariantStock[key] = String(v.stock);
  }
  const [variantStock, setVariantStock] = useState<Record<string, string>>(initVariantStock);

  const toggleValue = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const buildCombos = () => {
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
    setSuccess("");

    if (images.length === 0) { setError("At least one image required"); return; }
    const priceNum = Math.round(parseFloat(basePrice) * 100);
    if (!priceNum || priceNum < 100) { setError("Enter a valid price"); return; }

    let variants: UpdateProductInput["variants"] = [];
    if (hasVariants) {
      const skuBase = title.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 12).replace(/-$/, "");
      variants = combos.map((c) => ({
        sku: `${skuBase}-${c.key.replace(/[^A-Za-z0-9]+/g, "").toUpperCase()}`,
        options: c.options,
        priceDelta: 0,
        stock: parseInt(variantStock[c.key] || "0", 10) || 0,
        isActive: true,
      }));
    }

    const payload: UpdateProductInput = {
      title, description,
      shortDescription: shortDescription || undefined,
      categoryId, gender, images,
      basePrice: priceNum,
      compareAtPrice: compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : undefined,
      hasVariants, variants,
      stock: hasVariants ? 0 : parseInt(stock || "0", 10) || 0,
      fabric, weave: weave || undefined, color: color || undefined,
      pattern: pattern || undefined, occasion: occasion || undefined,
      fit: fit || undefined, careInstructions: careInstructions || undefined,
      madeIn: "India",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured, isBestSeller, isNewArrival, status,
    };

    startTransition(async () => {
      const result = await updateProductAction(product._id, payload);
      if (result.ok) {
        setSuccess("Product updated successfully");
        router.refresh();
      } else {
        setError(result.error || "Update failed");
      }
    });
  };

  const inputClass = "w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "mb-1 block text-sm font-medium";
  const subCategories = categories.filter(
    (c) => c.parentId && (gender === "unisex" || c.slug.startsWith(`${gender}-`)),
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 pb-16">
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div>}

      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div>
          <label className={labelClass}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Short Description</label>
          <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={4} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Category *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} required>
              <option value="">Select</option>
              {subCategories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
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
          <div><label className={labelClass}>Base Price (₹) *</label><input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className={inputClass} required min={1} /></div>
          <div><label className={labelClass}>Compare-at Price (₹)</label><input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className={inputClass} /></div>
        </div>
      </section>

      {/* Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Variants</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="h-4 w-4" />
            Has variants
          </label>
        </div>
        {!hasVariants ? (
          <div><label className={labelClass}>Stock *</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} min={0} /></div>
        ) : (
          <>
            <div>
              <label className={labelClass}>Sizes</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_SIZES.map((s) => (
                  <button key={s} type="button" onClick={() => toggleValue(sizes, setSizes, s)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${sizes.includes(s) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Art Form</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ART_FORMS.map((a) => (
                  <button key={a} type="button" onClick={() => toggleValue(artForms, setArtForms, a)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${artForms.includes(a) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{a}</button>
                ))}
              </div>
            </div>
            {combos.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left font-medium">Variant</th><th className="px-3 py-2 text-right font-medium">Stock</th></tr></thead>
                  <tbody className="divide-y">
                    {combos.map((c) => (
                      <tr key={c.key}>
                        <td className="px-3 py-2">{Object.values(c.options).join(" · ")}</td>
                        <td className="px-3 py-2 text-right">
                          <input type="number" min={0} value={variantStock[c.key] || ""} onChange={(e) => setVariantStock((prev) => ({ ...prev, [c.key]: e.target.value }))} className="w-20 rounded border px-2 py-1 text-right text-sm" placeholder="0" />
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
          <div><label className={labelClass}>Fabric *</label><input value={fabric} onChange={(e) => setFabric(e.target.value)} className={inputClass} required /></div>
          <div><label className={labelClass}>Weave</label><input value={weave} onChange={(e) => setWeave(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Color</label><input value={color} onChange={(e) => setColor(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Pattern</label><input value={pattern} onChange={(e) => setPattern(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Occasion</label><input value={occasion} onChange={(e) => setOccasion(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Fit</label><input value={fit} onChange={(e) => setFit(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Care Instructions</label><textarea value={careInstructions} onChange={(e) => setCareInstructions(e.target.value)} className={inputClass} rows={2} /></div>
        <div><label className={labelClass}>Tags (comma separated)</label><input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} /></div>
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
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="rounded-lg border px-6 py-3 text-sm font-medium hover:bg-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
