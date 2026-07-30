"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";

export function CustomerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    
    router.push(`/admin/customers?${params.toString()}`);
  }
  
  function onClear() {
    setSearch("");
    setStatus("all");
    router.push("/admin/customers");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end mb-6">
      <div className="grid gap-2 flex-1 min-w-[200px]">
        <label className="text-sm font-medium">Search</label>
        <Input 
          placeholder="Name, email, phone..." 
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
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
