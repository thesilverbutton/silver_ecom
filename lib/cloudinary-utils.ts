import type { ImageLoaderProps } from "next/image";

/**
 * Pure client-safe utility for Cloudinary URL optimization.
 * Does NOT import Node.js 'cloudinary' SDK so it can be safely used in client & server components.
 */
export function getOptimizedCloudinaryUrl(url: string, width?: number): string {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;

  const transforms: string[] = [];
  if (!url.includes("f_auto")) transforms.push("f_auto");
  if (!url.includes("q_auto")) transforms.push("q_auto");
  if (width && !/(?:^|[,/])w_\d+(?:[,/]|$)/.test(url)) transforms.push(`w_${width}`);

  if (transforms.length === 0) return url;
  return url.replace("/image/upload/", `/image/upload/${transforms.join(",")}/`);
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

export function cloudinaryLoader({ src, width }: ImageLoaderProps): string {
  return getOptimizedCloudinaryUrl(src, width);
}
