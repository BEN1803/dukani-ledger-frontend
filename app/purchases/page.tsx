"use client"
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MetricCard } from "@/components/ui/metric-card";
import { PurchaseForm } from "@/components/pos/purchase-form";
import { PurchasesHistoryTable } from "@/components/pos/purchases-history-table";
import { useAllPurchases, useCreatePurchase } from "@/hooks/use-purchases";
import { useProducts } from "@/hooks/use-products";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { useAuthStore } from "@/store/auth-store";
import type { PageResponse, PurchaseResponse } from "@/types";
import { Plus, Truck, ShoppingCart, DollarSign, Package, Calendar } from "lucide-react";

const PAGE_SIZE = 10;

function paginateClient(items: PurchaseResponse[], page: number, size: number): PageResponse<PurchaseResponse> {
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

export default function PurchasesPage() {
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const role = useAuthStore((s) => s.role);
  const isWorker = role === "WORKER";

  const { data: allPurchases, isLoading } = useAllPurchases(selectedDate);
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const createPurchase = useCreatePurchase();
  const createCategory = useCreateCategory();

  const filteredPurchases = useMemo(() => allPurchases ?? [], [allPurchases]);
  const pagedData = useMemo(() => paginateClient(filteredPurchases, page, PAGE_SIZE), [filteredPurchases, page]);

  const totalCost = filteredPurchases.reduce((sum, p) => sum + p.costPrice * p.quantity, 0);
  const totalQuantity = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);

  const formattedDate = selectedDate
    ? format(new Date(selectedDate + "T00:00:00"), "MMMM d, yyyy")
    : "—";

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["OWNER", "ADMIN", "WORKER"]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              canCreateCategory={!isWorker}
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
            title="Total Cost"
            value={`TSh ${totalCost.toLocaleString()}`}
            icon={DollarSign}
            subtitle={`${filteredPurchases.length} purchase${filteredPurchases.length !== 1 ? "s" : ""} on this day`}
          />
          <MetricCard
            title="Total Items"
            value={totalQuantity.toLocaleString()}
            icon={Package}
            subtitle={formattedDate}
          />
          <MetricCard
            title="Avg. Purchase"
            value={filteredPurchases.length > 0 ? `TSh ${Math.round(totalCost / filteredPurchases.length).toLocaleString()}` : "TSh 0"}
            icon={ShoppingCart}
            subtitle="Per transaction"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>
              {isWorker
                ? `Your purchases for ${formattedDate}`
                : `Purchases for ${formattedDate}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PurchasesHistoryTable data={pagedData} isLoading={isLoading} onPageChange={setPage} />
          </CardContent>
        </Card>
      </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
