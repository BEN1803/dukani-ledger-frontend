"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { useWorkers } from "@/hooks/use-workers";
import {
  useDailyProfitHistory,
  useProductProfits,
  useMonthlyProfit,
  useMonthlyProfitHistory,
} from "@/hooks/use-profits";
import { useSales } from "@/hooks/use-sales";
import { useAuthStore } from "@/store/auth-store";
import { StatCard } from "@/components/ui/stat-card";
import { formatDateSafe, isSameDayLocal } from "@/lib/dates";
import Link from "next/link";

export default function DashboardPage() {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const role = useAuthStore((s) => s.role);
  const email = useAuthStore((s) => s.email);
  const isWorker = role === "WORKER";

  const { data: products } = useProducts();
  const { data: stockData } = useStock();
  const { data: workers } = useWorkers();
  const { data: dailyHistory } = useDailyProfitHistory(undefined, undefined, !isWorker);
  const { data: profitByProduct } = useProductProfits(!isWorker);
  const { data: monthlyProfit } = useMonthlyProfit(nowYear, nowMonth, !isWorker);
  const { data: monthlyHistory } = useMonthlyProfitHistory(undefined, !isWorker);
  const { data: recentSales } = useSales(0, isWorker ? 100 : 5);

  const workerName = isWorker
    ? workers?.find((w) => w.email === email)?.fullname || email || ""
    : "";
  const mySales = isWorker
    ? (recentSales?.content ?? [])
        .filter((s) => s.soldByName === workerName)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime()
        )
    : [];
  const recentlySold = mySales.slice(0, 6);
  const todaySales = isWorker
    ? mySales.filter((s) => isSameDayLocal(s.soldAt, new Date()))
    : [];
  const todaySalesCount = todaySales.length;
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.totalPrice, 0);
  const lowStockCount = (stockData ?? []).filter((s) => s.quantityAvailable < 5).length;

  const productCounts = new Map<string, number>();
  for (const s of mySales) {
    productCounts.set(
      s.productName,
      (productCounts.get(s.productName) ?? 0) + s.quantity
    );
  }
  const mostSold = [...productCounts.entries()]
    .map(([productName, quantity]) => ({ productName, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);
  const maxSold = Math.max(1, ...mostSold.map((p) => p.quantity));

  const totalRevenue =
    profitByProduct?.reduce((sum, p) => sum + p.totalRevenue, 0) || 0;
  const totalProducts = products?.length || 0;
  const totalStock =
    stockData?.reduce((sum, s) => sum + s.quantityAvailable, 0) || 0;
  const activeWorkers =
    workers?.filter((w) => w.status === "ACTIVE").length || 0;
  const totalWorkers = workers?.length || 0;

  const prevMonth = nowMonth === 1 ? 12 : nowMonth - 1;
  const prevYear = nowMonth === 1 ? nowYear - 1 : nowYear;
  const prevProfit = monthlyHistory?.find(
    (h) => h.year === prevYear && h.month === prevMonth
  )?.totalProfit;
  const profitChange =
    prevProfit != null &&
    prevProfit > 0 &&
    monthlyProfit?.totalProfit != null
      ? ((monthlyProfit.totalProfit - prevProfit) / prevProfit) * 100
      : null;

  const metrics: {
    title: string;
    value: string;
    icon: LucideIcon;
    subtitle?: string;
    change?: number | null;
  }[] = [];
  if (!isWorker) {
    metrics.push({
      title: "Total Revenue",
      value: `TSh ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      subtitle: `Across ${totalProducts} products`,
    });
    metrics.push({
      title: "Available Stock",
      value: totalStock.toLocaleString(),
      icon: Package,
      subtitle: "units in inventory",
    });
    metrics.push({
      title: "Active Workers",
      value: activeWorkers.toLocaleString(),
      icon: Users,
      subtitle: `of ${totalWorkers} total workers`,
    });
    metrics.push({
      title: "Monthly Profit",
      value: monthlyProfit?.totalProfit
        ? `TSh ${monthlyProfit.totalProfit.toLocaleString()}`
        : "TSh 0",
      icon: TrendingUp,
      change: profitChange,
    });
  }

  const maxProfit = Math.max(
    0,
    ...(profitByProduct ?? []).map((p) => p.totalProfit)
  );
  const topProducts = (profitByProduct ?? []).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {isWorker ? `Hi, ${workerName}` : "Overview"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isWorker
                ? "Track the products you've sold."
                : "A snapshot of your shop's performance."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isWorker && (
              <Button asChild variant="outline">
                <Link href="/purchases">
                  <Package className="h-4 w-4" />
                  Log Purchase
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/sales/new">
                <Plus className="h-4 w-4" />
                Record Sale
              </Link>
            </Button>
          </div>
        </div>

        {isWorker && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Sales Today"
              value={String(todaySalesCount)}
              icon={TrendingUp}
              subtitle="sales recorded"
            />
            <StatCard
              title="Revenue Today"
              value={`TSh ${todaySalesTotal.toLocaleString()}`}
              icon={DollarSign}
              subtitle="from your sales"
            />
            <StatCard
              title="Low Stock Alerts"
              value={String(lowStockCount)}
              icon={AlertTriangle}
              accent={lowStockCount > 0 ? "warning" : "default"}
              subtitle="items below 5 units"
            />
            <StatCard
              title="Available Stock"
              value={totalStock.toLocaleString()}
              icon={Boxes}
              subtitle="units in inventory"
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {!isWorker && metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          {!isWorker && (
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily profit over time</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyHistory ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyHistory}>
                        <defs>
                          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0a5c36" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#0a5c36" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d4e0d4" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d) => formatDateSafe(d, "EEE")}
                          tick={{ fontSize: 12, fill: "#5c6b60" }}
                          axisLine={{ stroke: "#d4e0d4" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#5c6b60" }}
                          axisLine={{ stroke: "#d4e0d4" }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #d4e0d4",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          labelFormatter={(d) => formatDateSafe(d, "MMM d, yyyy")}
                          formatter={(value) => [`TSh ${Number(value).toLocaleString()}`, "Profit"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="totalProfit"
                          stroke="#0a5c36"
                          strokeWidth={2}
                          fill="url(#profitGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Skeleton className="h-72 w-full" />
                )}
              </CardContent>
            </Card>
          )}

          {!isWorker && (
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>By profit contribution</CardDescription>
              </CardHeader>
              <CardContent>
                {profitByProduct ? (
                  <div className="space-y-4">
                    {topProducts.map((p, i) => (
                      <div key={p.productId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-xs font-medium text-muted-foreground w-4">
                              {i + 1}
                            </span>
                            <span className="truncate font-medium text-foreground">
                              {p.productName}
                            </span>
                          </span>
                          <span className="shrink-0 font-semibold text-forest-600">
                            TSh {p.totalProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="ml-6 h-2 overflow-hidden rounded-full bg-mint-100 dark:bg-forest-800">
                          <div
                            className="h-full rounded-full bg-forest-600"
                            style={{
                              width: `${maxProfit > 0 ? (p.totalProfit / maxProfit) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {topProducts.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No sales data yet
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {isWorker ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Recently Sold</CardTitle>
                  <CardDescription>Products you sold most recently</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSales ? (
                    <div>
                      {recentlySold.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              #{sale.id.toString().padStart(4, "0")} &middot; {sale.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateSafe(sale.soldAt, "MMM d, HH:mm")} &middot; Qty {sale.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            TSh {sale.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {recentlySold.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No sales yet
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Sold Products</CardTitle>
                  <CardDescription>Products you sold the most</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSales ? (
                    <div className="space-y-4">
                      {mostSold.map((p, i) => (
                        <div key={p.productName} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 truncate">
                              <span className="text-xs font-medium text-muted-foreground w-4">
                                {i + 1}
                              </span>
                              <span className="truncate font-medium text-foreground">
                                {p.productName}
                              </span>
                            </span>
                            <span className="shrink-0 font-semibold text-forest-600">
                              {p.quantity} sold
                            </span>
                          </div>
                          <div className="ml-6 h-2 overflow-hidden rounded-full bg-mint-100 dark:bg-forest-800">
                            <div
                              className="h-full rounded-full bg-forest-600"
                              style={{
                                width: `${(p.quantity / maxSold) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {mostSold.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No sales yet
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest recorded sales</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentSales ? (
                    <div>
                      {recentSales.content.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              #{sale.id.toString().padStart(4, "0")} &middot; {sale.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateSafe(sale.soldAt, "MMM d, HH:mm")} &middot; {sale.soldByName}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            TSh {sale.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {recentSales.content.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No sales yet
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Worker Attendance</CardTitle>
                  <CardDescription>Worker status overview</CardDescription>
                </CardHeader>
                <CardContent>
                  {workers ? (
                    <div>
                      {workers.slice(0, 5).map((worker) => (
                        <div
                          key={worker.id}
                          className="flex items-center justify-between border-b border-border py-2.5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-100 text-xs font-semibold text-forest-700">
                              {worker.fullname
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {worker.fullname}
                              </p>
                              <p className="text-xs text-muted-foreground">{worker.email}</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              worker.status === "ACTIVE"
                                ? "success"
                                : worker.status === "INACTIVE"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {worker.status}
                          </Badge>
                        </div>
                      ))}
                      <Link href="/workers">
                        <Button variant="outline" className="mt-2 w-full">
                          Manage Workers
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}