"use client"
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useProduct } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { useSalesForProduct } from "@/hooks/use-sales";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: product, isLoading } = useProduct(id);
  const { data: stockData } = useStock();
  const { data: sales } = useSalesForProduct(id);

  const stockQty = stockData?.find((s) => s.productId === product?.productId)?.quantityAvailable ?? 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Package className="h-12 w-12 mb-3" />
          <p className="text-sm">Product not found</p>
          <Button variant="link" asChild>
            <Link href="/products">Back to products</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-sm text-zinc-500">{product.productId}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-500">Category</span>
                <span className="text-sm font-medium">{product.category || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-500">Cost Price</span>
                <span className="text-sm font-medium">
                  {product.costPrice ? `KSh ${product.costPrice.toLocaleString()}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-500">Selling Price</span>
                <span className="text-sm font-medium">
                  {product.sellingPrice ? `KSh ${product.sellingPrice.toLocaleString()}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-500">Stock</span>
                <Badge variant={stockQty <= 5 ? "destructive" : "default"}>{stockQty}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-500">Added By</span>
                <span className="text-sm">{product.addedByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-zinc-500">Created</span>
                <span className="text-sm">{format(new Date(product.createdAt), "MMM d, yyyy")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales History</CardTitle>
            </CardHeader>
            <CardContent>
              {sales && sales.content.length > 0 ? (
                <div className="space-y-2">
                  {sales.content.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                    >
                      <div>
                        <p className="text-sm font-medium">x{sale.quantity}</p>
                        <p className="text-xs text-zinc-500">
                          {format(new Date(sale.soldAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">KSh {sale.totalPrice.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500">{sale.soldByName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                  <p className="text-sm">No sales for this product</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
