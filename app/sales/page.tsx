"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSales } from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import { useWorkers } from "@/hooks/use-workers";
import { useDailyProfitHistory } from "@/hooks/use-profits";
import { format } from "date-fns";
import {
  Plus,
  Download,
  Eye,
  DollarSign,
  LineChart,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useSales(page);
  const { data: products } = useProducts();
  const { data: workers } = useWorkers();
  const { data: dailyHistory } = useDailyProfitHistory();

  const weekData = dailyHistory?.slice(-7) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Input type="date" className="w-40" defaultValue={format(new Date(), "yyyy-MM-dd")} />
            <Select defaultValue="all">
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {(products || []).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Worker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workers</SelectItem>
                {(workers || []).map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>{w.fullname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </Button>
            <Button asChild size="sm">
              <Link href="/sales/new">
                <Plus className="h-4 w-4 mr-1" />
                New Sale
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {weekData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weekData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0a5c36" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0a5c36" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d4e0d4" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => format(new Date(d), "EEE")}
                      tick={{ fontSize: 12, fill: "#5c6b60" }}
                      axisLine={{ stroke: "#d4e0d4" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#5c6b60" }} axisLine={{ stroke: "#d4e0d4" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #d4e0d4",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      labelFormatter={(d) => format(new Date(d as string), "MMM d, yyyy")}
                      formatter={(value) => [`TSh ${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalProfit"
                      stroke="#0a5c36"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Skeleton className="h-64 w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
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
                      <tr className="bg-mint-100 dark:bg-forest-800">
                        <th className="text-left py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Sale ID</th>
                        <th className="text-left py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Product</th>
                        <th className="text-right py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Quantity</th>
                        <th className="text-right py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Total Amount</th>
                        <th className="text-left py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Date</th>
                        <th className="text-left py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Worker</th>
                        <th className="text-right py-3.5 px-4 font-semibold text-forest-800 dark:text-mint-100">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.content.map((sale) => (
                        <tr key={sale.id} className="border-b border-border hover:bg-mint-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                            #{sale.id.toString().padStart(4, "0")}
                          </td>
                          <td className="py-3.5 px-4 font-medium">{sale.productName}</td>
                          <td className="py-3.5 px-4 text-right">{sale.quantity}</td>
                          <td className="py-3.5 px-4 text-right font-semibold">
                            TSh {sale.totalPrice.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">
                            {format(new Date(sale.soldAt), "MMM d, yyyy")}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">{sale.soldByName}</td>
                          <td className="py-3.5 px-4 text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between pt-4 px-1">
                  <p className="text-sm text-muted-foreground">
                    Page {data.number + 1} of {data.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={data.first} onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mb-3" />
                <p className="text-sm">No sales yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
