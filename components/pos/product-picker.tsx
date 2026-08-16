"use client"
import { useMemo, useRef, useState, useEffect } from "react";
import { Search, ChevronDown, Check, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { LowStockBadge } from "@/components/pos/low-stock-badge";
import type { ProductResponse } from "@/types";

interface ProductPickerProps {
  products: ProductResponse[];
  stockMap: Map<string, number>;
  value: ProductResponse | null;
  onChange: (product: ProductResponse) => void;
  placeholder?: string;
}

export function ProductPicker({
  products,
  stockMap,
  value,
  onChange,
  placeholder = "Search products...",
}: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.productId?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setQuery("");
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:bg-mint-50 dark:hover:bg-forest-800",
          open && "ring-2 ring-ring ring-offset-1"
        )}
      >
        {value ? (
          <span className="flex items-center gap-2 truncate">
            <span className="truncate font-medium">{value.name}</span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {value.productId}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                className="pl-9"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <ul className="max-h-72 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <li className="flex flex-col items-center gap-1 py-8 text-muted-foreground">
                <PackageX className="h-8 w-8" />
                <p className="text-sm">No products found</p>
              </li>
            )}
            {filtered.map((p) => {
              const stock = stockMap.get(String(p.id)) ?? 0;
              const isSelected = value?.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(p);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-mint-50 dark:hover:bg-forest-800",
                      isSelected && "bg-mint-50 dark:bg-forest-800"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-forest-600" />}
                        <span className="truncate font-medium">{p.name}</span>
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                        {p.productId}{p.sellingPrice ? ` · TSh ${p.sellingPrice.toLocaleString()}` : ""}
                      </span>
                    </span>
                    <LowStockBadge quantity={stock} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}