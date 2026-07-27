"use client"
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const editSchema = z.object({
  sellingPrice: z.string().optional(),
  categoryName: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  const onSubmit = (data: EditForm) => {
    const payload: { sellingPrice?: number; categoryName?: string } = {};
    if (data.sellingPrice) payload.sellingPrice = Number(data.sellingPrice);
    if (data.categoryName) payload.categoryName = data.categoryName;

    updateProduct.mutate(
      { id, data: payload },
      { onSuccess: () => router.push(`/products/${id}`) }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-64 w-full max-w-lg" />
      </DashboardLayout>
    );
  }

  if (!product) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/products/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-sm text-forest-600">{product.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price (TSh)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  placeholder={product.sellingPrice?.toString() || "Enter selling price"}
                  {...register("sellingPrice")}
                />
                {errors.sellingPrice && (
                  <p className="text-xs text-red-500">{errors.sellingPrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder={product.category || "Enter category name"}
                  {...register("categoryName")}
                />
                {errors.categoryName && (
                  <p className="text-xs text-red-500">{errors.categoryName.message}</p>
                )}
              </div>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
