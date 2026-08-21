"use client"
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MetricCard } from "@/components/ui/metric-card";
import { SaleForm } from "@/components/pos/sale-form";
import { SalesHistoryTable } from "@/components/pos/sales-history-table";
import { useAllSales, useCreateSale, useUpdateSale } from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { useDailyProfit } from "@/hooks/use-profits";
import type { PageResponse, SaleResponse } from "@/types";
import { Plus, Receipt, Lock, DollarSign, TrendingUp, Calendar } from "lucide-react";

const PAGE_SIZE = 10;

function paginateClient(items: SaleResponse[], page: number, size: number): PageResponse<SaleResponse> {
  const totalElements = items.length;
  const totalPages = Math.ceil(totalElements / size);
  const start = page * size;
  const content = items.slice(start, start + size);

  return {
    content,
    totalPages,
    totalElements,
    size,
    number: page,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
    empty: content.length === 0,
  };
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SalesPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));

  const { data: allSales, isLoading } = useAllSales(selectedDate);
  const { data: products } = useProducts();
  const { data: stock } = useStock();
  const { data: dailyProfit } = useDailyProfit(selectedDate);
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();

  const filteredSales = useMemo(() => allSales ?? [], [allSales]);
  const pagedData = useMemo(() => paginateClient(filteredSales, page, PAGE_SIZE), [filteredSales, page]);

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalSalesCount = filteredSales.length;
  const profit = dailyProfit?.totalProfit ?? 0;

  const formattedDate = selectedDate
    ? format(new Date(selectedDate + "T00:00:00"), "MMMM d, yyyy")
    : "—";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
            <p className="text-sm text-muted-foreground">Record sales and review history</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Record Sale
            </Button>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-forest-600" />
                  Record a Sale
                </DialogTitle>
              </DialogHeader>
              <SaleForm
                products={products ?? []}
                stock={stock ?? []}
                isPending={createSale.isPending}
                onSubmit={(formData) => {
                  createSale.mutate(
                    { ...formData, soldAt: new Date().toISOString() },
                    {
                      onSuccess: () => {
                        setOpen(false);
                      },
                    }
                  );
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(0);
              }}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDate(toDateString(new Date()));
              setPage(0);
            }}
          >
            Today
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="Total Sales"
            value={`TSh ${totalSales.toLocaleString()}`}
            icon={DollarSign}
            subtitle={`${totalSalesCount} sale${totalSalesCount !== 1 ? "s" : ""} on this day`}
          />
          <MetricCard
            title="Daily Profit"
            value={`TSh ${profit.toLocaleString()}`}
            icon={TrendingUp}
            subtitle={formattedDate}
          />
          <MetricCard
            title="Avg. Sale"
            value={totalSalesCount > 0 ? `TSh ${Math.round(totalSales / totalSalesCount).toLocaleString()}` : "TSh 0"}
            icon={Receipt}
            subtitle="Per transaction"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Sales History
              <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-medium text-forest-700 dark:bg-forest-800 dark:text-mint-300">
                <Lock className="h-3 w-3" />
                Today&apos;s sales can be edited until day ends
              </span>
            </CardTitle>
            <CardDescription>Sales for {formattedDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesHistoryTable
              data={pagedData}
              isLoading={isLoading}
              onPageChange={setPage}
              onUpdate={(id, sellingPrice) => updateSale.mutate({ id, data: { sellingPrice } })}
              isUpdating={updateSale.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
