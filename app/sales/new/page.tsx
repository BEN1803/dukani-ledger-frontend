"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SaleForm } from "@/components/pos/sale-form";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { useCreateSale } from "@/hooks/use-sales";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";

export default function NewSalePage() {
  const { data: products } = useProducts();
  const { data: stock } = useStock();
  const createSale = useCreateSale();
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/sales">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Record Sale</h1>
            <p className="text-sm text-muted-foreground">Sell products from your counter</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-border bg-forest-600 px-6 py-4 dark:bg-forest-700">
            <CardTitle className="flex items-center gap-2 text-white">
              <Receipt className="h-5 w-5" />
              Sale Details
            </CardTitle>
          </div>
          <CardContent className="p-6 pt-6">
            <SaleForm
              products={products ?? []}
              stock={stock ?? []}
              isPending={createSale.isPending}
              onSubmit={(formData) => {
                createSale.mutate(
                  { ...formData, soldAt: new Date().toISOString() },
                  {
                    onSuccess: () => router.push("/sales"),
                  }
                );
              }}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}