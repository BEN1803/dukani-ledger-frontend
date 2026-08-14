"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePurchases, useCreatePurchase } from "@/hooks/use-purchases";
import { formatDateSafe } from "@/lib/dates";
import { Plus, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

const purchaseSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  categoryName: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  costPrice: z.coerce.number().min(0.01, "Cost price must be greater than 0"),
});

type PurchaseForm = z.infer<typeof purchaseSchema>;

export default function PurchasesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = usePurchases(page);
  const createPurchase = useCreatePurchase();
  const [open, setOpen] = useState(false);
  const role = useAuthStore((s) => s.role);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
  });

  const onSubmit = (data: PurchaseForm) => {
    createPurchase.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchases</h1>
            <p className="text-sm text-forest-600 dark:text-muted-foreground">Record product purchases</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                New Purchase
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record Purchase</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input id="productName" placeholder="e.g. Maize Flour" {...register("productName")} />
                  {errors.productName && <p className="text-xs text-red-500">{errors.productName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category</Label>
                  <Input id="categoryName" placeholder="e.g. Grains" {...register("categoryName")} />
                  {errors.categoryName && <p className="text-xs text-red-500">{errors.categoryName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" min="1" placeholder="10" {...register("quantity")} />
                    {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price (TSh)</Label>
                    <Input id="costPrice" type="number" step="0.01" min="0.01" placeholder="150" {...register("costPrice")} />
                    {errors.costPrice && <p className="text-xs text-red-500">{errors.costPrice.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createPurchase.isPending}>
                  {createPurchase.isPending ? "Recording..." : "Record Purchase"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : data && data.content.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="text-left py-3 px-2 font-medium text-zinc-500">Product</th>
                        <th className="text-left py-3 px-2 font-medium text-zinc-500">Category</th>
                        <th className="text-right py-3 px-2 font-medium text-zinc-500">Qty</th>
                        <th className="text-right py-3 px-2 font-medium text-zinc-500">Cost</th>
                        <th className="text-right py-3 px-2 font-medium text-zinc-500">Total</th>
                        <th className="text-left py-3 px-2 font-medium text-zinc-500">By</th>
                        <th className="text-left py-3 px-2 font-medium text-zinc-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.content.map((p) => (
                        <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800">
                          <td className="py-3 px-2 font-medium">{p.productName}</td>
                          <td className="py-3 px-2 text-zinc-500">{p.category}</td>
                          <td className="py-3 px-2 text-right">{p.quantity}</td>
                          <td className="py-3 px-2 text-right">TSh {p.costPrice.toLocaleString()}</td>
                          <td className="py-3 px-2 text-right font-medium">
                            TSh {(p.costPrice * p.quantity).toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-zinc-500">{p.purchasedByName}</td>
                          <td className="py-3 px-2 text-zinc-500">
                            {formatDateSafe(p.purchasedAt, "MMM d, HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between pt-4">
<p className="text-sm text-forest-600">
                     Page {data.number + 1} of {data.totalPages}
                   </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.first}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.last}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <ShoppingCart className="h-12 w-12 mb-3" />
                <p className="text-sm">No purchases yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
