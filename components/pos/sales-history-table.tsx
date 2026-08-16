"use client"
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateSafe } from "@/lib/dates";
import type { PageResponse, SaleResponse } from "@/types";

interface SalesHistoryTableProps {
  data?: PageResponse<SaleResponse>;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function SalesHistoryTable({ data, isLoading, onPageChange }: SalesHistoryTableProps) {
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
                  <th className="py-3 px-3 text-right font-medium">Qty</th>
                  <th className="py-3 px-3 text-right font-medium">Unit Price</th>
                  <th className="py-3 px-3 text-right font-medium">Total</th>
                  <th className="py-3 px-3 text-left font-medium">Sold By</th>
                  <th className="py-3 px-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((sale) => (
                  <tr key={sale.id} className="border-b border-border transition-colors hover:bg-mint-50/60 dark:hover:bg-forest-800/40">
                    <td className="py-3 px-3 font-medium">
                      <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">
                        #{sale.id.toString().padStart(4, "0")}
                      </span>
                      {sale.productName}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{sale.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-muted-foreground">
                      TSh {sale.sellingPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold font-mono tabular-nums text-forest-700 dark:text-mint-300">
                      TSh {sale.totalPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{sale.soldByName}</td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {formatDateSafe(sale.soldAt, "MMM d, HH:mm")}
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
          <DollarSign className="mb-3 h-12 w-12" />
          <p className="text-sm">No sales yet</p>
        </div>
      )}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  first,
  last,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={first} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={last} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}