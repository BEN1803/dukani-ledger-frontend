"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { useProductProfits } from "@/hooks/use-profits";
import { Plus, Search, Package, Eye, Edit3 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const { data: stockData } = useStock();
  const { data: productProfits } = useProductProfits();
  const [search, setSearch] = useState("");

  const stockMap = new Map(
    (stockData || []).map((s) => [String(s.productId), s.quantityAvailable])
  );

  const filtered = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const topProducts = (productProfits || []).slice(0, 5);
  const totalExpenses = (productProfits || []).reduce((s, p) => s + p.totalCost, 0);
  const totalRevenue = (productProfits || []).reduce((s, p) => s + p.totalRevenue, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link href="/purchases">
              <Plus className="mr-1 h-4 w-4" />
              Add Product
            </Link>
          </Button>
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
                <Package className="h-12 w-12 mb-3" />
                <p className="text-sm">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-mint-100 dark:bg-forest-800">
                      <th className="text-left py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Code</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Name</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Category</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Cost Price</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Selling Price</th>
                      <th className="text-center py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Stock</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => {
                      const stockQty = stockMap.get(product.productId) ?? 0;
                      return (
                        <tr
                          key={product.id}
                          className="border-b border-border hover:bg-mint-50/50 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">{product.productId}</td>
                          <td className="py-3.5 px-4 font-medium">
                            <Link
                              href={`/products/${product.id}`}
                              className="hover:text-forest-600 transition-colors"
                            >
                              {product.name}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">{product.category || "—"}</td>
                          <td className="py-3.5 px-4 text-right text-muted-foreground">
                            {product.costPrice ? `TSh ${product.costPrice.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {product.sellingPrice ? `TSh ${product.sellingPrice.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge variant={stockQty <= 5 ? "destructive" : stockQty <= 10 ? "warning" : "success"}>
                              {stockQty <= 5 ? "Low Stock" : stockQty <= 10 ? "Limited" : "In Stock"}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/products/${product.id}`}>
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/products/${product.id}/edit`}>
                                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                            </div>
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={p.productId} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{p.productName}</p>
                          <p className="text-xs text-muted-foreground">{p.quantitySold} sold</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-forest-600">
                        TSh {p.totalProfit.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {productProfits && productProfits.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="text-sm font-semibold text-forest-600">
                      TSh {totalRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Cost</span>
                    <span className="text-sm font-semibold text-red-600">
                      TSh {totalExpenses.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Net Profit</span>
                    <span className="text-sm font-bold text-forest-600">
                      TSh {(totalRevenue - totalExpenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
