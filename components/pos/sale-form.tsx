"use client"
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductPicker } from "@/components/pos/product-picker";
import type { ProductResponse, StockResponse } from "@/types";

const saleSchema = z.object({
  productId: z.number({ message: "Please select a product" }),
  sellingPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  products: ProductResponse[];
  stock: StockResponse[];
  isPending: boolean;
  onSubmit: (data: SaleFormData) => void;
}

export function SaleForm({ products, stock, isPending, onSubmit }: SaleFormProps) {
  const stockMap = new Map(stock.map((s) => [String(s.productId), s.quantityAvailable]));
  const [product, setProduct] = useState<ProductResponse | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema) as Resolver<SaleFormData>,
  });

  const quantity = Number(watch("quantity") || 0);
  const price = Number(watch("sellingPrice") || 0);
  const total = price * quantity;
  const available = product ? stockMap.get(String(product.id)) ?? 0 : 0;
  const exceedsStock = available > 0 && quantity > available;

  const handleProductSelect = (p: ProductResponse) => {
    setProduct(p);
    setValue("productId", p.id, { shouldValidate: true });
    if (p.sellingPrice) setValue("sellingPrice", p.sellingPrice);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label>Product</Label>
        <ProductPicker
          products={products}
          stockMap={stockMap}
          value={product}
          onChange={handleProductSelect}
        />
        {errors.productId && <p className="text-xs text-red-500">{errors.productId.message}</p>}
      </div>

      {product && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-mint-50 px-4 py-3 dark:bg-forest-800/60">
          <span className="text-sm font-medium">{product.productId}</span>
          <LowStockHint
            available={available}
            category={product.category || undefined}
            suggestedPrice={product.sellingPrice ?? undefined}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price (TSh)</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="font-mono tabular-nums"
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
            className="font-mono tabular-nums"
            {...register("quantity")}
          />
          {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
        </div>
      </div>

      {exceedsStock && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Quantity exceeds available stock ({quantity} &gt; {available}). The sale may be
            rejected by the system.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-forest-600 px-5 py-4 text-white shadow-sm dark:bg-forest-700">
        <span className="flex items-center gap-2 text-sm font-medium text-forest-100 dark:text-mint-200">
          <Calculator className="h-4 w-4" />
          Total
        </span>
        <span className="text-2xl font-bold tabular-nums tracking-tight">
          {total > 0 ? `TSh ${total.toLocaleString()}` : "—"}
        </span>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isPending || (product != null && available === 0 && quantity > 0)}
      >
        {isPending ? "Recording sale..." : "Record Sale"}
      </Button>
    </form>
  );
}

function LowStockHint({
  available,
  category,
  suggestedPrice,
}: {
  available: number;
  category?: string;
  suggestedPrice?: number;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-forest-700 dark:text-mint-200">
      {category && <span className="rounded-full bg-forest-100 px-2 py-0.5 dark:bg-forest-700">{category}</span>}
      <span className="tabular-nums">
        In stock: <strong>{available}</strong>
      </span>
      {suggestedPrice && (
        <span className="text-muted-foreground">
          Suggested: <strong className="text-forest-700 dark:text-mint-200">TSh {suggestedPrice.toLocaleString()}</strong>
        </span>
      )}
    </div>
  );
}