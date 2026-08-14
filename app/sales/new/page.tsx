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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { useCreateSale } from "@/hooks/use-sales";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const saleSchema = z.object({
  productId: z.coerce.number({ message: "Product is required" }),
  sellingPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type SaleForm = z.infer<typeof saleSchema>;

export default function NewSalePage() {
  const { data: products } = useProducts();
  const { data: stock } = useStock();
  const createSale = useCreateSale();
  const router = useRouter();

  const stockMap = new Map(stock?.map((s) => [String(s.productId), s.quantityAvailable]) || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SaleForm>({
    resolver: zodResolver(saleSchema),
  });

  const selectedProductId = watch("productId");
  const selectedProduct = products?.find((p) => p.id === selectedProductId);
  const availableStock = selectedProduct ? stockMap.get(String(selectedProduct.id)) ?? 0 : 0;
  const totalPrice = (Number(watch("sellingPrice") || 0) * Number(watch("quantity") || 0)).toLocaleString();

  const onSubmit = (data: SaleForm) => {
    createSale.mutate({ ...data, soldAt: new Date().toISOString() }, {
      onSuccess: () => router.push("/sales"),
    });
  };

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
            <h1 className="text-2xl font-bold">New Sale</h1>
            <p className="text-sm text-forest-600 dark:text-muted-foreground">Record a product sale</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sale Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  onValueChange={(v) => {
                    setValue("productId", Number(v));
                    const p = products?.find((pr) => pr.id === Number(v));
                    if (p?.sellingPrice) setValue("sellingPrice", p.sellingPrice);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} ({p.productId}) - Stock: {stockMap.get(String(p.id)) ?? 0}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-xs text-red-500">{errors.productId.message}</p>}
                {selectedProductId && availableStock === 0 && (
                  <p className="text-xs text-red-500">Out of stock</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (TSh)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    {...register("sellingPrice")}
                  />
                  {errors.sellingPrice && <p className="text-xs text-red-500">{errors.sellingPrice.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register("quantity")}
                  />
                  {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                </div>
              </div>

              {watch("sellingPrice") && watch("quantity") && (
                <div className="rounded-lg bg-mint-50 p-4 text-center dark:bg-forest-900/20">
                  <p className="text-sm text-forest-600 dark:text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-forest-600">TSh {totalPrice}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={createSale.isPending || (selectedProductId ? availableStock === 0 : false)}
              >
                {createSale.isPending ? "Processing..." : "Complete Sale"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
