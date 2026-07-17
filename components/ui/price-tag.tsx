import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";

interface PriceTagProps {
  /** Price in paise */
  price: number;
  /** Compare-at price in paise (shown as strikethrough) */
  compareAtPrice?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function PriceTag({ price, compareAtPrice, className, size = "md" }: PriceTagProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className={cn("inline-flex items-baseline gap-2", sizeClasses[size], className)}>
      <span className="font-semibold text-foreground">{formatINR(price)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through">{formatINR(compareAtPrice)}</span>
          <span className="text-xs font-medium text-success">-{discountPercent}%</span>
        </>
      )}
    </div>
  );
}

export { PriceTag };
