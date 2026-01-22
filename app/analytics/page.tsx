import { AppShell } from "@/components/layout/app-shell"
import { AnalyticsClientSections } from "@/components/analytics/analytics-client-sections"
import { createClient } from "@/lib/supabase/server"
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns"

const formatMonthKey = (date: Date) => format(date, "yyyy-MM")
const safeNumber = (value: unknown) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}
const parseCountValue = (value: unknown, rawValue?: string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const raw = String(rawValue ?? "").trim().toLowerCase()
  if (!raw) return null
  if (raw === "nil" || raw === "none") return 0
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return null
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const now = new Date()
  const lastEightMonths = Array.from({ length: 8 }, (_, index) =>
    startOfMonth(subMonths(now, 7 - index))
  )
  const lastFourMonths = lastEightMonths.slice(4)
  const rangeStart = lastEightMonths[0]
  const rangeEnd = endOfMonth(now)

  const { data: receipts, error: receiptsError } = await supabase
    .from("receipts")
    .select("receipt_date, amount")
    .gte("receipt_date", format(rangeStart, "yyyy-MM-dd"))
    .lte("receipt_date", format(rangeEnd, "yyyy-MM-dd"))

  if (receiptsError) throw new Error(receiptsError.message)

  const { data: latestReceipts, error: latestReceiptError } = await supabase
    .from("receipts")
    .select("receipt_date, amount, amount_received, balance")
    .order("receipt_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)

  if (latestReceiptError) throw new Error(latestReceiptError.message)

  const totalsByMonth = new Map<string, number>()
  lastEightMonths.forEach((date) => totalsByMonth.set(formatMonthKey(date), 0))

  ;(receipts ?? []).forEach((receipt) => {
    if (!receipt.receipt_date) return
    const key = formatMonthKey(parseISO(receipt.receipt_date))
    if (!totalsByMonth.has(key)) return
    totalsByMonth.set(key, totalsByMonth.get(key)! + safeNumber(receipt.amount))
  })

  const currentTotals = lastFourMonths.map(
    (date) => totalsByMonth.get(formatMonthKey(date)) ?? 0
  )
  const prevTotals = lastEightMonths
    .slice(0, 4)
    .map((date) => totalsByMonth.get(formatMonthKey(date)) ?? 0)

  const avgCurrent =
    currentTotals.reduce((sum, value) => sum + value, 0) / currentTotals.length
  const avgPrev =
    prevTotals.reduce((sum, value) => sum + value, 0) / prevTotals.length
  const avgChange =
    avgPrev > 0 ? Number((((avgCurrent - avgPrev) / avgPrev) * 100).toFixed(2)) : 0

  const stockChartData = lastFourMonths.map((date, index) => ({
    month: format(date, "MMM"),
    value: totalsByMonth.get(formatMonthKey(date)) ?? 0,
    highlight: index === lastFourMonths.length - 1,
  }))
  const spendTotal = currentTotals.reduce((sum, value) => sum + value, 0)
  const spendRangeLabel = `${format(lastFourMonths[0], "MMM yyyy")} - ${format(
    lastFourMonths[lastFourMonths.length - 1],
    "MMM yyyy"
  )}`

  const monthlyComparison = lastFourMonths
    .slice()
    .reverse()
    .map((date, index, arr) => {
      const value = totalsByMonth.get(formatMonthKey(date)) ?? 0
      const prevDate = arr[index + 1]
      const prevValue = prevDate
        ? totalsByMonth.get(formatMonthKey(prevDate)) ?? 0
        : 0
      const change =
        prevValue > 0 ? Number((((value - prevValue) / prevValue) * 100).toFixed(1)) : 0
      return {
        month: format(date, "MMMM"),
        value,
        change,
      }
    })

  const { data: itemsData, error: itemsError } = await supabase
    .from("inventory_items")
    .select("id, name, category:inventory_categories(name)")
    .eq("is_active", true)
    .order("name")

  if (itemsError) throw new Error(itemsError.message)

  const items = itemsData ?? []

  const categoryCounts = new Map<string, number>()
  items.forEach((item: any) => {
    const name = item.category?.name ?? "Uncategorized"
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1)
  })

  const categoryPalette = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f87171"]
  const totalItems = items.length
  const categoryChartData = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      name,
      value: totalItems === 0 ? 0 : Math.round((count / totalItems) * 100),
      color: categoryPalette[index % categoryPalette.length],
    }))

  const largestShare = categoryChartData[0]?.value ?? 0
  const categoryBalance =
    totalItems === 0 ? "No data" : largestShare <= 50 ? "Good" : largestShare <= 70 ? "Fair" : "Skewed"

  const { data: countDates, error: countDatesError } = await supabase
    .from("stock_counts")
    .select("count_date")
    .order("count_date", { ascending: false })
    .limit(120)

  if (countDatesError) throw new Error(countDatesError.message)

  const uniqueDates: string[] = []
  for (const row of countDates ?? []) {
    const date = String(row.count_date)
    if (!uniqueDates.includes(date)) uniqueDates.push(date)
    if (uniqueDates.length >= 3) break
  }

  const [latestDate, prevDate, olderDate] = uniqueDates
  let topConsumed: { name: string; consumption: number; color: string }[] = []
  let totalConsumption = 0
  let prevConsumption = 0
  let avgOnHand = 0

  if (latestDate && prevDate) {
    const { data: countsData, error: countsError } = await supabase
      .from("stock_counts")
      .select("item_id, count_date, qty_numeric, raw_value, item:inventory_items(name)")
      .in("count_date", [latestDate, prevDate, olderDate].filter(Boolean))

    if (countsError) throw new Error(countsError.message)

    const byItem = new Map<
      string,
      { name: string; latest?: number | null; prev?: number | null; older?: number | null }
    >()

    for (const row of countsData ?? []) {
      const entry = byItem.get(row.item_id) ?? {
        name: row.item?.name ?? "Unknown item",
      }
      const value = parseCountValue(row.qty_numeric, row.raw_value)
      if (row.count_date === latestDate) entry.latest = value
      if (row.count_date === prevDate) entry.prev = value
      if (row.count_date === olderDate) entry.older = value
      byItem.set(row.item_id, entry)
    }

    const consumptionRows = Array.from(byItem.values()).map((entry) => {
      const latest = entry.latest ?? null
      const prev = entry.prev ?? null
      const consumption =
        latest != null && prev != null ? Math.max(0, prev - latest) : 0
      return { name: entry.name, consumption }
    })

    consumptionRows.sort((a, b) => b.consumption - a.consumption)
    const top = consumptionRows.slice(0, 5)
    const maxConsumption = top[0]?.consumption ?? 0
    const colorTokens = ["chart-1", "chart-2", "chart-3", "chart-5", "chart-4"]

    topConsumed = top.map((row, index) => ({
      name: row.name,
      consumption: maxConsumption > 0 ? Math.round((row.consumption / maxConsumption) * 100) : 0,
      color: colorTokens[index % colorTokens.length],
    }))

    totalConsumption = consumptionRows.reduce((sum, row) => sum + row.consumption, 0)
    const avgEntries = Array.from(byItem.values())
      .map((entry) => entry.latest)
      .filter((value): value is number => typeof value === "number")
    avgOnHand =
      avgEntries.length > 0
        ? avgEntries.reduce((sum, value) => sum + value, 0) / avgEntries.length
        : 0

    if (olderDate) {
      prevConsumption = Array.from(byItem.values()).reduce((sum, entry) => {
        const prev = entry.prev ?? null
        const older = entry.older ?? null
        if (prev == null || older == null) return sum
        return sum + Math.max(0, older - prev)
      }, 0)
    }
  }

  if (topConsumed.length === 0) {
    const colorTokens = ["chart-1", "chart-2", "chart-3", "chart-5", "chart-4"]
    topConsumed = items.slice(0, 5).map((item: any, index: number) => ({
      name: item.name,
      consumption: 0,
      color: colorTokens[index % colorTokens.length],
    }))
  }

  const turnoverValue = avgOnHand > 0 ? totalConsumption / avgOnHand : 0
  const prevTurnover = avgOnHand > 0 ? prevConsumption / avgOnHand : 0
  const turnoverChange =
    prevTurnover > 0
      ? Number((((turnoverValue - prevTurnover) / prevTurnover) * 100).toFixed(1))
      : 0
  const wasteReduction =
    prevConsumption > 0
      ? Number((((prevConsumption - totalConsumption) / prevConsumption) * 100).toFixed(1))
      : 0

  const latestReceipt = latestReceipts?.[0] ?? null
  const latestReceived =
    latestReceipt?.amount_received != null
      ? Number(latestReceipt.amount_received)
      : null
  const latestSpent =
    latestReceipt?.amount != null ? Number(latestReceipt.amount) : null
  const amountAtHand =
    latestReceipt?.balance != null
      ? Number(latestReceipt.balance)
      : latestReceived != null && latestSpent != null
        ? latestReceived - latestSpent
        : null

  const hasAnalyticsData =
    (receipts?.length ?? 0) > 0 ||
    items.length > 0 ||
    (countDates?.length ?? 0) > 0 ||
    latestReceipt != null

  return (
    <AppShell title="Analytics" subtitle="Insights and data visualization">
      <AnalyticsClientSections
        hasAnalyticsData={hasAnalyticsData}
        avgCurrent={avgCurrent}
        avgChange={avgChange}
        turnoverValue={turnoverValue}
        turnoverChange={turnoverChange}
        wasteReduction={wasteReduction}
        categoryBalance={categoryBalance}
        amountAtHand={amountAtHand}
        stockChartData={stockChartData}
        spendRangeLabel={spendRangeLabel}
        spendTotal={spendTotal}
        categoryChartData={categoryChartData}
        totalItems={totalItems}
        topConsumed={topConsumed}
        monthlyComparison={monthlyComparison}
      />
    </AppShell>
  )
}
