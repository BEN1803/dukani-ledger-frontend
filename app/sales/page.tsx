"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaleForm } from "@/components/pos/sale-form";
import { SalesHistoryTable } from "@/components/pos/sales-history-table";
import { useSales, useCreateSale, useUpdateSale } from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { Plus, Receipt, Lock } from "lucide-react";

export default function SalesPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useSales(page);
  const { data: products } = useProducts();
  const { data: stock } = useStock();
  const createSale = useCreateSale();
  const updateSale = useUpdateSale();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Sales History
              <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-medium text-forest-700 dark:bg-forest-800 dark:text-mint-300">
                <Lock className="h-3 w-3" />
                Today&apos;s sales can be edited until day ends
              </span>
            </CardTitle>
            <CardDescription>All recorded sales, newest first</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesHistoryTable
              data={data}
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