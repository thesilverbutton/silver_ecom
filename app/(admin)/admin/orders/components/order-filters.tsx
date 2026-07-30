"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get("paymentStatus") || "all");
  const [fulfillmentStatus, setFulfillmentStatus] = useState(searchParams.get("fulfillmentStatus") || "all");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    if (paymentStatus && paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
    if (fulfillmentStatus && fulfillmentStatus !== "all") params.set("fulfillmentStatus", fulfillmentStatus);
    
    router.push(`/admin/orders?${params.toString()}`);
  }
  
  function onClear() {
    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setFulfillmentStatus("all");
    router.push("/admin/orders");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end mb-6">
      <div className="grid gap-2 flex-1 min-w-[200px]">
        <label className="text-sm font-medium">Search</label>
        <Input 
          placeholder="Order #, email, phone..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="grid gap-2 w-full sm:w-[150px]">
        <label className="text-sm font-medium">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2 w-full sm:w-[150px]">
        <label className="text-sm font-medium">Payment</label>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2 w-full sm:w-[150px]">
        <label className="text-sm font-medium">Fulfillment</label>
        <Select value={fulfillmentStatus} onValueChange={setFulfillmentStatus}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fulfillment</SelectItem>
            <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Filter</Button>
        <Button type="button" variant="outline" onClick={onClear}>Clear</Button>
      </div>
    </form>
  )
}
