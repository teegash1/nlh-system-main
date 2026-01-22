"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  CategoryChartSkeleton,
  StockChartSkeleton,
} from "@/components/dashboard/dashboard-skeletons"
import { BarChart3, PieChart, TrendingDown, TrendingUp, Wallet } from "lucide-react"

const StockChart = dynamic(
  () => import("@/components/dashboard/stock-chart").then((mod) => mod.StockChart),
  { ssr: false, loading: () => <StockChartSkeleton /> }
)
const CategoryChart = dynamic(
  () =>
    import("@/components/dashboard/category-chart").then(
      (mod) => mod.CategoryChart
    ),
  { ssr: false, loading: () => <CategoryChartSkeleton /> }
)

type StockChartDatum = {
  month: string
  value: number
  highlight: boolean
}

type CategoryChartDatum = {
  name: string
  value: number
  color: string
}

type ConsumptionRow = {
  name: string
  consumption: number
  color: string
}

type MonthlyComparisonRow = {
  month: string
  value: number
  change: number
}

export function AnalyticsClientSections({
  hasAnalyticsData,
  avgCurrent,
  avgChange,
  turnoverValue,
  turnoverChange,
  wasteReduction,
  categoryBalance,
  amountAtHand,
  stockChartData,
  spendRangeLabel,
  spendTotal,
  categoryChartData,
  totalItems,
  topConsumed,
  monthlyComparison,
}: {
  hasAnalyticsData: boolean
  avgCurrent: number
  avgChange: number
  turnoverValue: number
  turnoverChange: number
  wasteReduction: number
  categoryBalance: string
  amountAtHand: number | null
  stockChartData: StockChartDatum[]
  spendRangeLabel: string
  spendTotal: number
  categoryChartData: CategoryChartDatum[]
  totalItems: number
  topConsumed: ConsumptionRow[]
  monthlyComparison: MonthlyComparisonRow[]
}) {
  const emptyValue = "—"
  const emptyLabel = "No data yet"

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="md:hidden">
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track inventory trends and patterns
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Avg Monthly Spend"
          value={
            hasAnalyticsData
              ? `KES ${Math.round(avgCurrent).toLocaleString()}`
              : emptyValue
          }
          change={hasAnalyticsData ? avgChange : undefined}
          changeLabel={hasAnalyticsData ? "vs prev. quarter" : emptyLabel}
          trend={hasAnalyticsData ? (avgChange >= 0 ? "up" : "down") : "neutral"}
          icon={<TrendingUp className="h-5 w-5 text-chart-2" />}
        />
        <StatCard
          title="Stock Turnover"
          value={hasAnalyticsData ? `${turnoverValue.toFixed(1)}x` : emptyValue}
          change={hasAnalyticsData ? turnoverChange : undefined}
          changeLabel={hasAnalyticsData ? "improvement" : emptyLabel}
          trend={
            hasAnalyticsData ? (turnoverChange >= 0 ? "up" : "down") : "neutral"
          }
          icon={<BarChart3 className="h-5 w-5 text-chart-1" />}
        />
        <StatCard
          title="Waste Reduction"
          value={
            hasAnalyticsData
              ? `${Math.abs(Math.round(wasteReduction))}%`
              : emptyValue
          }
          change={hasAnalyticsData ? wasteReduction : undefined}
          changeLabel={hasAnalyticsData ? "vs last period" : emptyLabel}
          trend={
            hasAnalyticsData ? (wasteReduction >= 0 ? "up" : "down") : "neutral"
          }
          icon={<TrendingDown className="h-5 w-5 text-chart-4" />}
        />
        <StatCard
          title="Category Balance"
          value={hasAnalyticsData ? categoryBalance : emptyValue}
          changeLabel={hasAnalyticsData ? "Optimized" : emptyLabel}
          trend="neutral"
          icon={<PieChart className="h-5 w-5 text-chart-5" />}
        />
        <StatCard
          title="Amount at hand"
          value={
            hasAnalyticsData && amountAtHand != null
              ? `KES ${amountAtHand.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}`
              : emptyValue
          }
          changeLabel={hasAnalyticsData ? "Balance after expenses" : emptyLabel}
          trend="neutral"
          icon={<Wallet className="h-5 w-5 text-chart-3" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockChart
          data={stockChartData}
          rangeLabel={spendRangeLabel}
          totalLabel={`KES ${Math.round(spendTotal).toLocaleString()}`}
        />
        <CategoryChart data={categoryChartData} totalCount={totalItems} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Top Consumed Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topConsumed.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.consumption}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-${item.color}`}
                      style={{ width: `${item.consumption}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Monthly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyComparison.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.month}</p>
                    <p className="text-xs text-muted-foreground">2025/2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      KES {item.value.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs ${
                        item.change > 0 ? "text-chart-2" : "text-chart-4"
                      }`}
                    >
                      {item.change > 0 ? "+" : ""}
                      {item.change}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
