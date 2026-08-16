"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PurchaseForm } from "@/components/pos/purchase-form";
import { PurchasesHistoryTable } from "@/components/pos/purchases-history-table";
import { usePurchases, useCreatePurchase } from "@/hooks/use-purchases";
import { useProducts } from "@/hooks/use-products";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { Plus, Truck } from "lucide-react";

export default function PurchasesPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = usePurchases(page);
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const createPurchase = useCreatePurchase();
  const createCategory = useCreateCategory();

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["OWNER", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
            <p className="text-sm text-muted-foreground">Record restocks and purchases</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Log Purchase
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-forest-600" />
                Record a Purchase
              </DialogTitle>
            </DialogHeader>
            <PurchaseForm
              products={products ?? []}
              categories={categories ?? []}
              isPending={createPurchase.isPending}
              isCreatingCategory={createCategory.isPending}
              onCreateCategory={async (name) => {
                await createCategory.mutateAsync({ name });
              }}
              onSubmit={(formData) => {
                createPurchase.mutate(formData, {
                  onSuccess: () => {
                    setOpen(false);
                  },
                });
              }}
            />
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>All recorded purchases, newest first</CardDescription>
          </CardHeader>
          <CardContent>
            <PurchasesHistoryTable data={data} isLoading={isLoading} onPageChange={setPage} />
          </CardContent>
        </Card>
      </div>
      </RoleGuard>
    </DashboardLayout>
  );
}