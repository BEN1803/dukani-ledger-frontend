"use client"
import { ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateSafe } from "@/lib/dates";
import { Pagination } from "@/components/pos/sales-history-table";
import type { PageResponse, PurchaseResponse } from "@/types";

interface PurchasesHistoryTableProps {
  data?: PageResponse<PurchaseResponse>;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function PurchasesHistoryTable({ data, isLoading, onPageChange }: PurchasesHistoryTableProps) {
  return (
    <div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data && data.content.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-3 px-3 text-left font-medium">Product</th>
                  <th className="py-3 px-3 text-left font-medium">Category</th>
                  <th className="py-3 px-3 text-right font-medium">Qty</th>
                  <th className="py-3 px-3 text-right font-medium">Cost</th>
                  <th className="py-3 px-3 text-right font-medium">Total</th>
                  <th className="py-3 px-3 text-left font-medium">By</th>
                  <th className="py-3 px-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((p) => (
                  <tr key={p.id} className="border-b border-border transition-colors hover:bg-mint-50/60 dark:hover:bg-forest-800/40">
                    <td className="py-3 px-3 font-medium">{p.productName}</td>
                    <td className="py-3 px-3 text-muted-foreground">{p.category}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{p.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      TSh {p.costPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold font-mono tabular-nums text-forest-700 dark:text-mint-300">
                      TSh {(p.costPrice * p.quantity).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{p.purchasedByName}</td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formatDateSafe(p.purchasedAt, "MMM d, HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.number}
            totalPages={data.totalPages}
            first={data.first}
            last={data.last}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ShoppingCart className="mb-3 h-12 w-12" />
          <p className="text-sm">No purchases yet</p>
        </div>
      )}
    </div>
  );
}