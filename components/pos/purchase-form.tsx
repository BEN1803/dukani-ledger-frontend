"use client"
import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CategoryResponse, ProductResponse } from "@/types";

const purchaseSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  categoryName: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  costPrice: z.coerce.number().min(0.01, "Cost price must be greater than 0"),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  products: ProductResponse[];
  categories: CategoryResponse[];
  isPending: boolean;
  isCreatingCategory: boolean;
  canCreateCategory?: boolean;
  onSubmit: (data: PurchaseFormData) => void;
  onCreateCategory: (name: string) => Promise<void>;
}

export function PurchaseForm({
  products,
  categories,
  isPending,
  isCreatingCategory,
  canCreateCategory = true,
  onSubmit,
  onCreateCategory,
}: PurchaseFormProps) {
  const [nameQuery, setNameQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const productNames = Array.from(new Set(products.map((p) => p.name.trim()).filter(Boolean)));
  const suggestions = nameQuery.trim()
    ? productNames
        .filter((n) => n.toLowerCase().includes(nameQuery.toLowerCase()))
        .slice(0, 6)
    : productNames.slice(0, 6);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema) as Resolver<PurchaseFormData>,
  });

  const handleSubmitForm = (data: PurchaseFormData) => {
    onSubmit({
      ...data,
      categoryName: categoryValue,
    });
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name || isCreatingCategory) return;
    await onCreateCategory(name);
    setCategoryValue(name);
    setValue("categoryName", name);
    setAddingCategory(false);
    setNewCategory("");
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="productName">Product Name</Label>
        <div ref={rootRef} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="productName"
            className="pl-9"
            placeholder="e.g. Maize Flour"
            {...register("productName")}
            onChange={(e) => {
              setValue("productName", e.target.value);
              setNameQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl animate-in fade-in-0 zoom-in-95">
              {suggestions.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("productName", name);
                      setNameQuery(name);
                      setShowSuggestions(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-mint-50 dark:hover:bg-forest-800"
                  >
                    <Check className="h-4 w-4 text-forest-600" />
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.productName && <p className="text-xs text-red-500">{errors.productName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <div className="space-y-2">
          {addingCategory ? (
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="font-medium"
                autoFocus
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || isCreatingCategory}
              >
                {isCreatingCategory ? "Adding..." : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddingCategory(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Select
              value={categoryValue}
              onValueChange={(v) => {
                setCategoryValue(v);
                setValue("categoryName", v, { shouldValidate: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={categories.length ? "Select a category" : "No categories yet"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
                {canCreateCategory && (
                  <button
                    type="button"
                    onClick={() => setAddingCategory(true)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 pl-8 text-sm text-forest-600 hover:bg-mint-50 dark:text-mint-300 dark:hover:bg-forest-800"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Add new category
                  </button>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        {errors.categoryName && <p className="text-xs text-red-500">{errors.categoryName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            placeholder="10"
            className="font-mono tabular-nums"
            {...register("quantity")}
          />
          {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price (TSh)</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="150"
            className="font-mono tabular-nums"
            {...register("costPrice")}
          />
          {errors.costPrice && <p className="text-xs text-red-500">{errors.costPrice.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isPending || isCreatingCategory}>
        {isPending ? "Recording purchase..." : "Record Purchase"}
      </Button>
    </form>
  );
}

export type { PurchaseFormData };