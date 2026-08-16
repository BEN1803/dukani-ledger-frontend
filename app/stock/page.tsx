"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { StockTable } from "@/components/pos/stock-table";
import { useStock } from "@/hooks/use-stock";

const LOW_STOCK_THRESHOLD = 5;

export default function StockPage() {
  const { data: stock, isLoading } = useStock();

  const lowStockCount = (stock ?? []).filter((s) => s.quantityAvailable < LOW_STOCK_THRESHOLD).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Levels</h1>
          <p className="text-sm text-muted-foreground">Current inventory across all products</p>
        </div>

        {lowStockCount > 0 && (
          <Card className="border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-900/20">
            <CardContent className="flex items-center gap-3 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {lowStockCount} {lowStockCount === 1 ? "product is" : "products are"} running low
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Restock soon — items below {LOW_STOCK_THRESHOLD} units.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Stock</CardTitle>
            <CardDescription>Search, review, and reorder inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <StockTable stock={stock} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}