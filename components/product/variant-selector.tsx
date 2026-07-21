"use client";

import { cn } from "@/lib/utils";

interface VariantOption {
  value: string;
  label: string;
  available: boolean;
}

interface VariantSelectorProps {
  label: string;
  options: VariantOption[];
  selected?: string;
  onChange: (value: string) => void;
  className?: string;
}

function VariantSelector({ label, options, selected, onChange, className }: VariantSelectorProps) {
  return (
    <div className={cn("", className)}>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected === option.value}
            disabled={!option.available}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
              selected === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-secondary",
              !option.available && "cursor-not-allowed opacity-40 line-through",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export { VariantSelector, type VariantOption };
