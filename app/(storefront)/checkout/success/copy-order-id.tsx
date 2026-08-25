"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyOrderIdProps {
  orderId: string;
}

export function CopyOrderId({ orderId }: CopyOrderIdProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 pl-4 pr-2 py-1.5 font-mono text-sm font-semibold text-primary">
      <span>Order #{orderId}</span>
      <button
        onClick={onCopy}
        className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        title="Copy Order ID"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        <span className="sr-only">Copy Order ID</span>
      </button>
    </div>
  );
}
