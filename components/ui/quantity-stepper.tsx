"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

function QuantityStepper({ value, onChange, min = 1, max = 99, disabled = false, className }: QuantityStepperProps) {
  return (
    <div className={cn("inline-flex items-center rounded-lg border", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-secondary disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="flex h-9 w-10 items-center justify-center text-sm font-medium" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-secondary disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export { QuantityStepper };
