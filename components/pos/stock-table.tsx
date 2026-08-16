"use client"
import { useMemo, useState } from "react";
import { Search, Boxes } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LowStockBadge } from "@/components/pos/low-stock-badge";
import { formatDateSafe } from "@/lib/dates";
import type { StockResponse } from "@/types";

interface StockTableProps {
  stock?: StockResponse[];
  isLoading: boolean;
}

export function StockTable({ stock, isLoading }: StockTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !stock) return stock ?? [];
    return stock.filter(
      (s) =>
        s.productName.toLowerCase().includes(q) ||
        s.productCode.toLowerCase().includes(q)
    );
  }, [stock, query]);

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by product name or code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-3 px-3 text-left font-medium">Product</th>
                <th className="py-3 px-3 text-left font-medium">Code</th>
                <th className="py-3 px-3 text-right font-medium">Available</th>
                <th className="py-3 px-3 text-left font-medium">Status</th>
                <th className="py-3 px-3 text-left font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border transition-colors hover:bg-mint-50/60 dark:hover:bg-forest-800/40">
                  <td className="py-3 px-3 font-medium">{s.productName}</td>
                  <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{s.productCode}</td>
                  <td
                    className={
                      "py-3 px-3 text-right font-mono text-lg font-bold tabular-nums " +
                      (s.quantityAvailable < 5
                        ? "text-red-600 dark:text-red-400"
                        : "text-forest-700 dark:text-mint-300")
                    }
                  >
                    {s.quantityAvailable}
                  </td>
                  <td className="py-3 px-3">
                    <LowStockBadge quantity={s.quantityAvailable} />
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">
                    {formatDateSafe(s.updatedAt, "MMM d, yyyy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Boxes className="mb-3 h-12 w-12" />
          <p className="text-sm">{stock && stock.length > 0 ? "No products match your search" : "No stock data yet"}</p>
        </div>
      )}
    </div>
  );
}