"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStock } from "@/hooks/use-stock";
import { formatDateSafe } from "@/lib/dates";
import { Boxes } from "lucide-react";

export default function StockPage() {
  const { data: stock, isLoading } = useStock();

  const lowStock = stock?.filter((s) => s.quantityAvailable <= 3) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Stock</h1>
          <p className="text-sm text-forest-600 dark:text-muted-foreground">
            Current inventory levels
          </p>
        </div>

        {lowStock.length > 0 && (
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 dark:text-red-400">
                Low Stock Alert ({lowStock.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStock.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                    <div>
                      <p className="text-sm font-medium">{s.productName}</p>
                      <p className="text-xs text-forest-600">{s.productCode}</p>
                    </div>
                    <Badge variant="destructive">{s.quantityAvailable}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : stock && stock.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Product Code</th>
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Product</th>
                      <th className="text-right py-3 px-2 font-medium text-zinc-500">Quantity</th>
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="py-3 px-2 font-mono text-xs">{s.productCode}</td>
                        <td className="py-3 px-2 font-medium">{s.productName}</td>
                        <td className="py-3 px-2 text-right">
                          <Badge variant={s.quantityAvailable <= 3 ? "destructive" : s.quantityAvailable <= 10 ? "secondary" : "default"}>
                            {s.quantityAvailable}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-zinc-500">
                          {formatDateSafe(s.updatedAt, "MMM d, yyyy HH:mm")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <Boxes className="h-12 w-12 mb-3" />
                <p className="text-sm">No stock data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
