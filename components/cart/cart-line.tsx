"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { PriceTag } from "@/components/ui/price-tag";
import { IconButton } from "@/components/ui/icon-button";

interface CartLineProps {
  title: string;
  image: string;
  price: number;
  quantity: number;
  options?: Record<string, string>;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
  maxQuantity?: number;
  className?: string;
}

function CartLine({
  title,
  image,
  price,
  quantity,
  options,
  onQuantityChange,
  onRemove,
  maxQuantity = 10,
  className,
}: CartLineProps) {
  return (
    <div className={cn("flex gap-4 py-4", className)}>
      {/* Image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image src={image} alt={title} fill className="object-cover" sizes="80px" />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-medium leading-tight line-clamp-2">{title}</p>
          {options && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {Object.entries(options).map(([k, v]) => `${k}: ${v}`).join(" / ")}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper value={quantity} onChange={onQuantityChange} max={maxQuantity} />
          <div className="flex items-center gap-2">
            <PriceTag price={price * quantity} size="sm" />
            <IconButton label="Remove item" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CartLine };
