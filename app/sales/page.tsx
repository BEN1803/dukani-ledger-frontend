"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaleForm } from "@/components/pos/sale-form";
import { SalesHistoryTable } from "@/components/pos/sales-history-table";
import { useSales, useCreateSale } from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { Plus, Receipt } from "lucide-react";

export default function SalesPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useSales(page);
  const { data: products } = useProducts();
  const { data: stock } = useStock();
  const createSale = useCreateSale();

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
            <CardTitle>Sales History</CardTitle>
            <CardDescription>All recorded sales, newest first</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesHistoryTable data={data} isLoading={isLoading} onPageChange={setPage} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}