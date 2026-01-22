"use client"

import dynamic from "next/dynamic"
import { useMemo, useRef, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CategoryFilter } from "@/components/stock/category-filter"
import { AddItemDialog } from "@/components/stock/add-item-dialog"
import { AddCountDialog } from "@/components/stock/add-count-dialog"
import { CategoryManagerDialog } from "@/components/stock/category-manager-dialog"
import { ReminderScheduler } from "@/components/stock/reminder-scheduler"
import { DateFilter } from "@/components/stock/date-filter"
import type { StockCountRow } from "@/components/stock/counts-table"
import type { StockItemRow } from "@/components/stock/items-table"
import type { StockItem } from "@/components/stock/stock-table"
import { AlertTriangle, CalendarDays, Layers, ListChecks, Package } from "lucide-react"
import {
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from "date-fns"

const TableSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
    <div className="h-4 w-32 rounded bg-secondary/70" />
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="grid grid-cols-4 gap-3">
        <div className="h-3 rounded bg-secondary/60 col-span-2" />
        <div className="h-3 rounded bg-secondary/60" />
        <div className="h-3 rounded bg-secondary/60" />
      </div>
    ))}
  </div>
)

const WeeklyTabsSkeleton = () => (
  <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4 animate-pulse">
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-7 w-20 rounded bg-secondary/70" />
      ))}
    </div>
    <div className="h-56 rounded bg-secondary/60" />
  </div>
)

const WeeklyTabs = dynamic(
  () => import("@/components/stock/weekly-tabs").then((mod) => mod.WeeklyTabs),
  { ssr: false, loading: () => <WeeklyTabsSkeleton /> }
)
const ItemsTable = dynamic(
  () => import("@/components/stock/items-table").then((mod) => mod.ItemsTable),
  { ssr: false, loading: () => <TableSkeleton rows={8} /> }
)
const CountsTable = dynamic(
  () => import("@/components/stock/counts-table").then((mod) => mod.CountsTable),
  { ssr: false, loading: () => <TableSkeleton rows={6} /> }
)

export type StockRow = {
  id: string
  name: string
  category: string
  unit: string
  reorder_level: number | null
  asOf: string | null
  displayValue: string
}

type WeeklyCount = {
  itemId: string
  countDate: string
  rawValue: string
  qtyNumeric: number | null
  qtyUnit: string | null
}

type DateFilterType = "this-week" | "this-month" | "last-3-months" | "ytd" | "custom"

const getNumericCount = (count?: StockCountRow | null) => {
  if (!count) return null
  if (typeof count.qtyNumeric === "number" && Number.isFinite(count.qtyNumeric)) {
    return Number(count.qtyNumeric)
  }
  const raw = String(count.rawValue ?? "").trim().toLowerCase()
  if (!raw) return null
  if (raw === "nil" || raw === "none") return 0
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return null
}

export default function StockClient({
  initialData,
  categories,
  categoryOptions,
  items,
  counts,
  weeklyDates,
  weeklyCounts,
  countedItemIds,
}: {
  initialData: StockRow[]
  categories: string[]
  categoryOptions: { id: string; name: string }[]
  items: { id: string; name: string; unit: string }[]
  counts: StockCountRow[]
  weeklyDates: string[]
  weeklyCounts: WeeklyCount[]
  countedItemIds: string[]
}) {
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [reorderOnly, setReorderOnly] = useState(false)
  const [weeklyStatusFilter, setWeeklyStatusFilter] = useState<"all" | "risk">("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    from: Date
    to: Date
  } | null>(null)
  const weeklySectionRef = useRef<HTMLDivElement | null>(null)
  const latestStocktake =
    initialData.find((row) => row.asOf)?.asOf ?? "—"
  const latestStocktakeLabel =
    latestStocktake === "—" ? "No stocktake yet" : latestStocktake

  const weeklyLabels = useMemo(
    () =>
      weeklyDates.map((date) => ({
        date,
        label: format(parseISO(date), "MMM d"),
      })),
    [weeklyDates]
  )

  const weeklyColumns = weeklyLabels.map((entry) => entry.label)
  const weeklyTabs = useMemo(
    () =>
      weeklyLabels.map((entry, index) => {
        const baseDate = parseISO(entry.date)
        const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 })
        return {
          id: `week-${index + 1}`,
          label: `Week ${index + 1}`,
          dateRange: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
          weekLabel: entry.label,
          weekDate: entry.date,
        }
      }),
    [weeklyLabels]
  )

  const visibleWeeklyTabs = useMemo(() => {
    if (!dateRangeFilter) return weeklyTabs
    return weeklyTabs.filter((tab) => {
      const date = parseISO(tab.weekDate)
      return date >= dateRangeFilter.from && date <= dateRangeFilter.to
    })
  }, [dateRangeFilter, weeklyTabs])

  const countsByItem = useMemo(() => {
    const map = new Map<string, StockCountRow>()
    counts.forEach((count) => {
      map.set(count.itemId, count)
    })
    return map
  }, [counts])

  const countedItemSet = useMemo(
    () => new Set(countedItemIds),
    [countedItemIds]
  )

  const weeklyCountsByItem = useMemo(() => {
    const map = new Map<string, Map<string, WeeklyCount>>()
    weeklyCounts.forEach((count) => {
      const itemMap = map.get(count.itemId) ?? new Map()
      itemMap.set(count.countDate, count)
      map.set(count.itemId, itemMap)
    })
    return map
  }, [weeklyCounts])

  const totalItems = initialData.length
  const totalCategories = categories.length
  const countedItems = countsByItem.size
  const coveragePercent =
    totalItems === 0 ? 0 : Math.round((countedItems / totalItems) * 100)

  const lowStockItems = useMemo(
    () =>
      initialData.filter((row) => {
        const count = countsByItem.get(row.id)
        const qtyValue = getNumericCount(count)
        if (qtyValue == null) return false
        if (Number(qtyValue) <= 0) return true
        if (row.reorder_level == null) return false
        return Number(qtyValue) <= Number(row.reorder_level)
      }),
    [countsByItem, initialData]
  )

  const lowStockIds = useMemo(() => {
    return new Set(lowStockItems.map((item) => item.id))
  }, [lowStockItems])

  const missingCounts = useMemo(
    () => initialData.filter((row) => !countedItemSet.has(row.id)),
    [countedItemSet, initialData]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialData.filter((row) => {
      const matchesQuery =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
      const matchesCategory =
        categoryFilter === "all" || row.category === categoryFilter
      const matchesReorder = !reorderOnly || lowStockIds.has(row.id)
      return matchesQuery && matchesCategory && matchesReorder
    })
  }, [initialData, query, categoryFilter, reorderOnly, lowStockIds])

  const itemRows: StockItemRow[] = filtered.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    reorderLevel: row.reorder_level,
    latestCount: row.displayValue,
    asOf: row.asOf,
  }))

  const weeklyRows: StockItem[] = filtered.map((row) => {
    const weekData: Record<string, string> = {}
    weeklyLabels.forEach(({ date, label }) => {
      const entry = weeklyCountsByItem.get(row.id)?.get(date)
      weekData[label] = entry?.rawValue ?? "—"
    })

    const latestEntry = countsByItem.get(row.id)
    const latestQty = getNumericCount(latestEntry)
    let status: StockItem["status"] = "in-stock"
    if (!latestEntry || latestQty == null) {
      status = "low-stock"
    } else if (latestQty <= 0) {
      status = "out-of-stock"
    } else if (
      row.reorder_level != null &&
      Number(latestQty) <= Number(row.reorder_level)
    ) {
      status = "low-stock"
    }

    return {
      id: row.id,
      item: row.name,
      category: row.category,
      unit: row.unit,
      reorderLevel: row.reorder_level,
      weekData,
      status,
    }
  })

  const weeklyRowsFiltered =
    weeklyStatusFilter === "risk"
      ? weeklyRows.filter(
          (row) => row.status === "low-stock" || row.status === "out-of-stock"
        )
      : weeklyRows

  const handleDateFilter = (
    filter: DateFilterType,
    range?: { from: Date; to: Date }
  ) => {
    const now = new Date()
    if (filter === "custom" && range?.from && range?.to) {
      setDateRangeFilter({ from: range.from, to: range.to })
      return
    }
    if (filter === "this-week") {
      setDateRangeFilter({
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      })
      return
    }
    if (filter === "this-month") {
      setDateRangeFilter({ from: startOfMonth(now), to: endOfMonth(now) })
      return
    }
    if (filter === "last-3-months") {
      setDateRangeFilter({ from: subMonths(now, 3), to: now })
      return
    }
    if (filter === "ytd") {
      setDateRangeFilter({ from: startOfYear(now), to: now })
    }
  }

  const summaryCards = [
    {
      label: "Items tracked",
      value: totalItems.toLocaleString(),
      helper: "Active inventory lines",
      icon: Package,
    },
    {
      label: "Categories",
      value: totalCategories.toLocaleString(),
      helper: "Organized ministries",
      icon: Layers,
    },
    {
      label: "Coverage",
      value: `${coveragePercent}%`,
      helper: `${countedItems} of ${totalItems} counted`,
      icon: ListChecks,
    },
  ]

  return (
    <AppShell title="Stock Taking" subtitle="Inventory snapshot and stewardship overview">
      <div className="p-4 md:p-6 space-y-6">
        <div className="rounded-2xl border border-border bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)] p-5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-secondary/60 text-foreground">
                  Live Snapshot
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Latest Stocktake: {latestStocktakeLabel}
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                Stocktaking Overview
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Stewardship-ready inventory with accountable counts, reorder visibility, and
                clean audit trails for ministry operations.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <AddItemDialog categories={categories} />
              <AddCountDialog items={items} />
              <CategoryManagerDialog categories={categoryOptions} />
              <ReminderScheduler />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.label} className="border-border bg-card/80">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/60">
                    <card.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-xl font-semibold text-foreground">{card.value}</p>
                    <p className="text-[11px] text-muted-foreground">{card.helper}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-border bg-card/80">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/60">
                  <AlertTriangle className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Items to reorder
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {lowStockItems.length.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Low stock or out of stock
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => {
                    setWeeklyStatusFilter("risk")
                    weeklySectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                  }}
                >
                  View
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search items..."
                className="w-full md:w-72 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
              <CategoryFilter
                value={categoryFilter}
                categories={categories}
                onChange={setCategoryFilter}
              />
              <DateFilter onFilterChange={handleDateFilter} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReorderOnly((prev) => !prev)}
                className={`h-9 border-border text-xs ${
                  reorderOnly
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {reorderOnly ? "Reorder only" : "All items"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Filtered: {itemRows.length} items
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2" ref={weeklySectionRef}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Weekly Stocktake Matrix
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Compare the last {visibleWeeklyTabs.length || 0} stocktake dates across all items.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setWeeklyStatusFilter((prev) => (prev === "risk" ? "all" : "risk"))
                }
                className={`h-8 border-border text-[11px] ${
                  weeklyStatusFilter === "risk"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {weeklyStatusFilter === "risk" ? "Show all" : "Low + Out only"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {visibleWeeklyTabs.length === 0 ? (
              <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                No stocktake dates in the selected range yet.
              </div>
            ) : (
              <WeeklyTabs tabs={visibleWeeklyTabs} data={weeklyRowsFiltered} />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Reorder Watch
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Items at or below reorder thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockItems.length === 0 ? (
                <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                  All tracked items are above their reorder levels.
                </div>
              ) : (
                lowStockItems.slice(0, 4).map((item) => {
                  const count = countsByItem.get(item.id)
                  const remainingQty = getNumericCount(count)
                  const remainingLabel =
                    remainingQty == null
                      ? count?.rawValue ?? "—"
                      : `${remainingQty} ${count?.qtyUnit ?? item.unit}`
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Reorder level: {item.reorder_level ?? "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{remainingLabel}</p>
                        <Badge variant="outline" className="border-chart-4/40 text-chart-4">
                          Low
                        </Badge>
                      </div>
                    </div>
                  )
                })
              )}
              {lowStockItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={() => {
                    setWeeklyStatusFilter("risk")
                    weeklySectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                  }}
                >
                  View all low stock items
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Missing Counts
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Items without a record on the latest stocktake date.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {missingCounts.length === 0 ? (
                <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                  All items have a count on the latest stocktake date.
                </div>
              ) : (
                missingCounts.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Category: {item.category}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-chart-3/40 text-chart-3">
                      Pending
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Inventory Items
              </p>
              <p className="text-xs text-muted-foreground">
                Manage items and their latest counts.
              </p>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Latest: {latestStocktakeLabel}
            </div>
          </div>
          <ItemsTable items={itemRows} categories={categories} />
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Latest Stocktake Entries
              </p>
              <p className="text-xs text-muted-foreground">
                Manage the most recent count records.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Latest Date: {latestStocktakeLabel}
            </div>
          </div>
          <CountsTable counts={counts} />
        </div>
      </div>
    </AppShell>
  )
}
