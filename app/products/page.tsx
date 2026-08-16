"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts, useUpdateProduct } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { useAuthStore } from "@/store/auth-store";
import { Search, PackageOpen, Pencil, Check, X } from "lucide-react";
import { useState } from "react";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const { data: stockData } = useStock();
  const role = useAuthStore((s) => s.role);
  const updateProduct = useUpdateProduct();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [priceDraft, setPriceDraft] = useState("");

  const canEdit = role !== "WORKER";

  const startEdit = (id: number, sellingPrice: number | null) => {
    setEditingId(id);
    setPriceDraft(sellingPrice ? String(sellingPrice) : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPriceDraft("");
  };

  const saveEdit = (id: number) => {
    const sellingPrice = Number(priceDraft);
    if (!priceDraft.trim() || Number.isNaN(sellingPrice) || sellingPrice <= 0) return;
    updateProduct.mutate(
      { id, data: { sellingPrice } },
      { onSuccess: cancelEdit }
    );
  };

  const stockMap = new Map(
    (stockData || []).map((s) => [String(s.productId), s.quantityAvailable])
  );

  const filtered = (products || []).filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.productId.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            {role === "WORKER"
              ? "Product catalog — sell from available stock."
              : "Your product catalog"}
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <PackageOpen className="mb-3 h-12 w-12" />
                <p className="text-sm">{products && products.length > 0 ? "No products found" : "No products yet — record a purchase to add one"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-3.5 px-4 text-left font-medium">Name</th>
                      <th className="py-3.5 px-4 text-left font-medium">Category</th>
                      {role !== "WORKER" && (
                        <th className="py-3.5 px-4 text-right font-medium">Cost Price</th>
                      )}
                      <th className="py-3.5 px-4 text-right font-medium">Selling Price</th>
                      <th className="py-3.5 px-4 text-right font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => {
                      const stockQty = stockMap.get(String(product.id)) ?? 0;
                      return (
                        <tr key={product.id} className="border-b border-border transition-colors hover:bg-mint-50/60 dark:hover:bg-forest-800/40">
                          <td className="py-3.5 px-4">
                            <p className="font-medium">{product.name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{product.productId}</p>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">{product.category || "—"}</td>
                          {role !== "WORKER" && (
                            <td className="py-3.5 px-4 text-right font-mono tabular-nums text-muted-foreground">
                              {product.costPrice ? `TSh ${product.costPrice.toLocaleString()}` : "—"}
                            </td>
                          )}
                          <td className="py-3.5 px-4 text-right">
                            {canEdit && editingId === product.id ? (
                              <div className="flex items-center justify-end gap-1">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  autoFocus
                                  className="h-8 w-28 font-mono tabular-nums text-right"
                                  value={priceDraft}
                                  onChange={(e) => setPriceDraft(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEdit(product.id);
                                    if (e.key === "Escape") cancelEdit();
                                  }}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-forest-600"
                                  onClick={() => saveEdit(product.id)}
                                  disabled={updateProduct.isPending}
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
                                <span className="font-mono tabular-nums font-medium">
                                  {product.sellingPrice ? `TSh ${product.sellingPrice.toLocaleString()}` : "—"}
                                </span>
                                {canEdit && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-forest-600"
                                    onClick={() => startEdit(product.id, product.sellingPrice)}
                                    aria-label="Edit selling price"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </td>
                          <td
                            className={
                              "py-3.5 px-4 text-right font-mono tabular-nums font-semibold " +
                              (stockQty < 5 ? "text-red-600 dark:text-red-400" : "text-forest-700 dark:text-mint-300")
                            }
                          >
                            {stockQty}
                            {stockQty < 5 && stockQty > 0 && (
                              <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                low
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}