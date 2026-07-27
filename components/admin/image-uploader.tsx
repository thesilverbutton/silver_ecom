"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ArrowUp, ArrowDown } from "lucide-react";

export const IMAGE_LABELS = [
  "Front",
  "Back",
  "Zoomed",
  "Customized",
  "Type 1",
  "Type 2",
  "Type 3",
] as const;

export type ImageLabel = (typeof IMAGE_LABELS)[number];

export interface UploadedImage {
  url: string;
  publicId: string;
  label: ImageLabel;
  alt: string;
  width: number;
  height: number;
  position: number;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  productTitle?: string;
}

export function ImageUploader({ images, onChange, productTitle = "" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<ImageLabel | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usedLabels = images.map((i) => i.label);
  const availableLabels = IMAGE_LABELS.filter((l) => !usedLabels.includes(l));

  const triggerUpload = () => {
    if (!selectedLabel) {
      setError("Select an image label first");
      return;
    }
    setError("");
    fileInputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    if (!selectedLabel) return;
    setError("");
    setUploading(true);

    try {
      const signRes = await fetch("/api/admin/uploads/sign", { method: "POST" });
      const signData = await signRes.json();
      if (!signData.ok) {
        setError("Failed to get upload signature");
        setUploading(false);
        return;
      }

      const { signature, timestamp, folder, cloudName, apiKey } = signData.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.secure_url) {
        setError("Upload failed");
        setUploading(false);
        return;
      }

      const newImage: UploadedImage = {
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
        label: selectedLabel,
        alt: `${productTitle || "Product"} — ${selectedLabel}`,
        width: uploadData.width,
        height: uploadData.height,
        position: images.length,
      };

      onChange([...images, newImage]);
      setSelectedLabel("");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i })));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const updated = [...images];
    [updated[index], updated[target]] = [updated[target]!, updated[index]!];
    onChange(updated.map((img, i) => ({ ...img, position: i })));
  };

  return (
    <div>
      {/* Step 1: pick a label */}
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">1. Choose image label</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {IMAGE_LABELS.map((label) => {
            const used = usedLabels.includes(label);
            return (
              <button
                key={label}
                type="button"
                disabled={used || uploading}
                onClick={() => { setSelectedLabel(label); setError(""); }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedLabel === label
                    ? "border-primary bg-primary text-primary-foreground"
                    : used
                      ? "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-50"
                      : "hover:bg-secondary"
                }`}
                title={used ? "Already uploaded" : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Step 2: upload */}
        <p className="mt-4 text-sm font-medium">2. Upload image</p>
        <button
          type="button"
          onClick={triggerUpload}
          disabled={uploading || availableLabels.length === 0}
          className="mt-2 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-6 transition-colors hover:border-primary hover:bg-secondary/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="mt-2 text-sm font-medium">
                {selectedLabel ? `Upload "${selectedLabel}" image` : "Select a label above first"}
              </span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {availableLabels.length === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">All labels used. Remove one to upload another.</p>
        )}
      </div>

      {/* Uploaded images */}
      {images.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Uploaded images ({images.length})</p>
          {images.map((img, i) => (
            <div key={img.publicId} className="flex items-center gap-3 rounded-lg border p-3">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
                <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="48px" />
              </div>
              <div className="flex-1">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {img.label}
                </span>
                {i === 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">Primary</span>
                )}
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="rounded p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30" aria-label="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1}
                  className="rounded p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30" aria-label="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => removeImage(i)}
                  className="rounded p-1.5 text-muted-foreground hover:text-destructive" aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
