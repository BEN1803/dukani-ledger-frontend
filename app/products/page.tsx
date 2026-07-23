"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { Plus, Search, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const { data: stockData } = useStock();
  const [search, setSearch] = useState("");

  const stockMap = new Map(
    (stockData || []).map((s) => [s.productId, s.quantityAvailable])
  );

  const filtered = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage your product catalog
            </p>
          </div>
          <Button asChild>
            <Link href="/purchases">
              <Plus className="mr-1 h-4 w-4" />
              New Purchase
            </Link>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search products..."
            className="pl-9 max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <Package className="h-12 w-12 mb-3" />
                <p className="text-sm">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Code</th>
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Name</th>
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Category</th>
                      <th className="text-right py-3 px-2 font-medium text-zinc-500">Cost Price</th>
                      <th className="text-right py-3 px-2 font-medium text-zinc-500">Selling Price</th>
                      <th className="text-right py-3 px-2 font-medium text-zinc-500">Stock</th>
                      <th className="text-right py-3 px-2 font-medium text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => {
                      const stockQty = stockMap.get(product.productId) ?? 0;
                      return (
                        <tr
                          key={product.id}
                          className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                        >
                          <td className="py-3 px-2 font-mono text-xs">{product.productId}</td>
                          <td className="py-3 px-2 font-medium">
                            <Link
                              href={`/products/${product.id}`}
                              className="hover:text-emerald-600 transition-colors"
                            >
                              {product.name}
                            </Link>
                          </td>
                          <td className="py-3 px-2 text-zinc-500">{product.category || "—"}</td>
                          <td className="py-3 px-2 text-right">
                            {product.costPrice ? `KSh ${product.costPrice.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3 px-2 text-right">
                            {product.sellingPrice ? `KSh ${product.sellingPrice.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Badge variant={stockQty <= 5 ? "destructive" : stockQty <= 10 ? "secondary" : "default"}>
                              {stockQty}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/products/${product.id}/edit`}>Edit</Link>
                            </Button>
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
