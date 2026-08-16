"use client"
import { useState } from "react";
import { DollarSign, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateSafe, isSameDayLocal } from "@/lib/dates";
import type { PageResponse, SaleResponse } from "@/types";

interface SalesHistoryTableProps {
  data?: PageResponse<SaleResponse>;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onUpdate?: (id: number, sellingPrice: number) => void;
  isUpdating?: boolean;
}

export function SalesHistoryTable({
  data,
  isLoading,
  onPageChange,
  onUpdate,
  isUpdating,
}: SalesHistoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [priceDraft, setPriceDraft] = useState("");

  const startEdit = (sale: SaleResponse) => {
    setEditingId(sale.id);
    setPriceDraft(String(sale.sellingPrice));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPriceDraft("");
  };

  const saveEdit = (id: number) => {
    const sellingPrice = Number(priceDraft);
    if (
      !priceDraft.trim() ||
      Number.isNaN(sellingPrice) ||
      sellingPrice <= 0 ||
      !onUpdate
    )
      return;
    onUpdate(id, sellingPrice);
    cancelEdit();
  };

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
                  {onUpdate && <th className="py-3 px-3 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.content.map((sale) => {
                  const isToday = isSameDayLocal(sale.soldAt, new Date());
                  const canEdit = !!onUpdate && isToday;
                  return (
                    <tr key={sale.id} className="border-b border-border transition-colors hover:bg-mint-50/60 dark:hover:bg-forest-800/40">
                      <td className="py-3 px-3 font-medium">
                        <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">
                          #{sale.id.toString().padStart(4, "0")}
                        </span>
                        {sale.productName}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">{sale.quantity}</td>
                      <td className="py-3 px-3 text-right">
                        {editingId === sale.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              autoFocus
                              className="h-8 w-24 font-mono tabular-nums text-right"
                              value={priceDraft}
                              onChange={(e) => setPriceDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(sale.id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-forest-600"
                              onClick={() => saveEdit(sale.id)}
                              disabled={isUpdating}
                              aria-label="Save price"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={cancelEdit}
                              aria-label="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-mono tabular-nums text-muted-foreground">
                              TSh {sale.sellingPrice.toLocaleString()}
                            </span>
                            {canEdit && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-forest-600"
                                onClick={() => startEdit(sale)}
                                aria-label="Edit selling price"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold font-mono tabular-nums text-forest-700 dark:text-mint-300">
                        TSh {sale.totalPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{sale.soldByName}</td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {formatDateSafe(sale.soldAt, "MMM d, HH:mm")}
                      </td>
                      {onUpdate && (
                        <td className="py-3 px-3 text-right">
                          {!canEdit && (
                            <span className="text-[11px] text-muted-foreground">
                              Locked
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
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