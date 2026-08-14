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
import { formatDateSafe } from "@/lib/dates";
import Link from "next/link";

export default function DashboardPage() {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;

  const { data: products } = useProducts();
  const { data: stockData } = useStock();
  const { data: workers } = useWorkers();
  const { data: dailyHistory } = useDailyProfitHistory();
  const { data: profitByProduct } = useProductProfits();
  const { data: monthlyProfit } = useMonthlyProfit(nowYear, nowMonth);
  const { data: monthlyHistory } = useMonthlyProfitHistory();
  const { data: recentSales } = useSales(0, 5);

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

  const metrics = [
    {
      title: "Total Revenue",
      value: `TSh ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      subtitle: `Across ${totalProducts} products`,
    },
    {
      title: "Available Stock",
      value: totalStock.toLocaleString(),
      icon: Package,
      subtitle: "units in inventory",
    },
    {
      title: "Active Workers",
      value: activeWorkers.toLocaleString(),
      icon: Users,
      subtitle: `of ${totalWorkers} total workers`,
    },
    {
      title: "Monthly Profit",
      value: monthlyProfit?.totalProfit
        ? `TSh ${monthlyProfit.totalProfit.toLocaleString()}`
        : "TSh 0",
      icon: TrendingUp,
      change: profitChange,
    },
  ];

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
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground">
              A snapshot of your shop&apos;s performance.
            </p>
          </div>
          <Button asChild>
            <Link href="/sales/new">
              <Plus className="h-4 w-4" />
              New Sale
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
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
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
        </div>
      </div>
    </DashboardLayout>
  );
}