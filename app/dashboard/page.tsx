"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
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
} from "@/hooks/use-profits";
import { useSales } from "@/hooks/use-sales";
import { format } from "date-fns";
import Link from "next/link";

export default function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: stockData, isLoading: stockLoading } = useStock();
  const { data: workers, isLoading: workersLoading } = useWorkers();
  const { data: dailyHistory } = useDailyProfitHistory();
  const { data: profitByProduct } = useProductProfits();
  const { data: monthlyProfit } = useMonthlyProfit(
    new Date().getFullYear(),
    new Date().getMonth() + 1
  );
  const { data: recentSales } = useSales(0, 5);

  const totalProducts = products?.length || 0;
  const totalStock = stockData?.reduce((sum, s) => sum + s.quantityAvailable, 0) || 0;
  const activeWorkers = workers?.filter((w) => w.status === "ACTIVE").length || 0;
  const inactiveWorkers = workers?.filter((w) => w.status === "INACTIVE").length || 0;
  const totalWorkers = workers?.length || 0;

  const statCards = [
    {
      title: "Total Sales",
      value: recentSales?.totalElements
        ? `TSh ${recentSales.content.reduce((s, r) => s + r.totalPrice, 0).toLocaleString()}`
        : "TSh 0",
      icon: DollarSign,
      variant: "dark" as const,
    },
    {
      title: "Available Stock",
      value: totalStock.toLocaleString(),
      icon: Package,
      variant: "mint" as const,
    },
    {
      title: "Active Workers",
      value: activeWorkers,
      subtitle: `${totalWorkers} total`,
      icon: Users,
      variant: "white" as const,
    },
    {
      title: "Monthly Profit",
      value: monthlyProfit?.totalProfit
        ? `TSh ${monthlyProfit.totalProfit.toLocaleString()}`
        : "TSh 0",
      icon: TrendingUp,
      variant: "dark" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const isDark = stat.variant === "dark";
            const isMint = stat.variant === "mint";
            return (
              <Card
                key={stat.title}
                className={
                  isDark
                    ? "border-0 bg-forest-600 text-white shadow-md"
                    : isMint
                    ? "border-0 bg-mint-100 text-forest-800 shadow-sm"
                    : "border-0 bg-white text-foreground shadow-sm"
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className={isDark ? "text-forest-100 text-sm" : "text-muted-foreground text-sm"}>{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.subtitle && (
                        <p className={isDark ? "text-forest-200 text-xs" : "text-muted-foreground text-xs"}>{stat.subtitle}</p>
                      )}
                    </div>
                    <div
                      className={
                        isDark
                          ? "rounded-xl bg-forest-700/50 p-3"
                          : isMint
                          ? "rounded-xl bg-white/60 p-3"
                          : "rounded-xl bg-mint-100 p-3"
                      }
                    >
                      <Icon className={isDark ? "h-5 w-5 text-mint-300" : "h-5 w-5 text-forest-600"} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
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
            </CardHeader>
            <CardContent>
              {profitByProduct ? (
                <div className="space-y-1">
                  {profitByProduct.slice(0, 6).map((p, i) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground w-5">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.productName}</p>
                          <p className="text-xs text-muted-foreground">{p.quantitySold} sold</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-forest-600">
                        TSh {p.totalProfit.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {profitByProduct.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
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
            </CardHeader>
            <CardContent>
              {recentSales ? (
                <div className="space-y-1">
                  {recentSales.content.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          #{sale.id.toString().padStart(4, "0")} &middot; {sale.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sale.soldAt), "MMM d, HH:mm")} &middot; {sale.soldByName}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        TSh {sale.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {recentSales.content.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No sales yet</p>
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
            </CardHeader>
            <CardContent>
              {workers ? (
                <div className="space-y-3">
                  {workers.slice(0, 5).map((worker) => (
                    <div
                      key={worker.id}
                      className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-mint-100 flex items-center justify-center text-xs font-semibold text-forest-700">
                          {worker.fullname.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{worker.fullname}</p>
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
                    <Button variant="outline" className="w-full mt-2">
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
