"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ShieldBan, ShieldCheck, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface CustomerActionsProps {
  id: string;
  isBlocked: boolean;
  name: string;
}

export function CustomerActions({ id, isBlocked, name }: CustomerActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleSuspend() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update customer status.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer() {
    if (loading) return;
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete customer. You may need super admin privileges.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded-md p-2 hover:bg-secondary outline-none transition-colors disabled:opacity-50"
          aria-label="Actions"
          disabled={loading}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-[160px] overflow-hidden rounded-md border bg-white shadow-md animate-in fade-in-80 zoom-in-95 p-1"
        >
          <DropdownMenu.Item
            onSelect={toggleSuspend}
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary focus:bg-secondary"
          >
            {isBlocked ? (
              <>
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Unsuspend</span>
              </>
            ) : (
              <>
                <ShieldBan className="h-4 w-4 text-orange-600" />
                <span>Suspend</span>
              </>
            )}
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="my-1 h-px bg-muted" />
          
          <DropdownMenu.Item
            onSelect={deleteCustomer}
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
