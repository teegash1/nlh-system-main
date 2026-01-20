"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryFilter } from "@/components/stock/category-filter"
import { AddItemDialog } from "@/components/stock/add-item-dialog"
import { AddCountDialog } from "@/components/stock/add-count-dialog"
import { CountsTable, type StockCountRow } from "@/components/stock/counts-table"
import { ItemsTable, type StockItemRow } from "@/components/stock/items-table"
import { StockTable, type StockItem } from "@/components/stock/stock-table"
import { AlertTriangle, CalendarDays, Layers, ListChecks, Package } from "lucide-react"
import { format, parseISO } from "date-fns"

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

export default function StockClient({
  initialData,
  categories,
  items,
  counts,
  weeklyDates,
  weeklyCounts,
}: {
  initialData: StockRow[]
  categories: string[]
  items: { id: string; name: string; unit: string }[]
  counts: StockCountRow[]
  weeklyDates: string[]
  weeklyCounts: WeeklyCount[]
}) {
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
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

  const countsByItem = useMemo(() => {
    const map = new Map<string, StockCountRow>()
    counts.forEach((count) => {
      map.set(count.itemId, count)
    })
    return map
  }, [counts])

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
        if (row.reorder_level == null) return false
        const count = countsByItem.get(row.id)
        if (!count || count.qtyNumeric == null) return false
        return Number(count.qtyNumeric) <= Number(row.reorder_level)
      }),
    [countsByItem, initialData]
  )

  const missingCounts = useMemo(
    () => initialData.filter((row) => !countsByItem.has(row.id)),
    [countsByItem, initialData]
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
      return matchesQuery && matchesCategory
    })
  }, [initialData, query, categoryFilter])

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
    let status: StockItem["status"] = "in-stock"
    if (!latestEntry) {
      status = "low-stock"
    } else if (latestEntry.qtyNumeric === 0) {
      status = "out-of-stock"
    } else if (
      row.reorder_level != null &&
      latestEntry.qtyNumeric != null &&
      Number(latestEntry.qtyNumeric) <= Number(row.reorder_level)
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
    {
      label: "Reorder watch",
      value: lowStockItems.length.toLocaleString(),
      helper: "At or below reorder level",
      icon: AlertTriangle,
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
            </div>
            <div className="text-xs text-muted-foreground">
              Filtered: {itemRows.length} items
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Weekly Stocktake Matrix
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Compare the last {weeklyColumns.length || 0} stocktake dates across all items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyColumns.length === 0 ? (
              <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                No historical stocktake dates yet. Add a count to begin the weekly view.
              </div>
            ) : (
              <StockTable data={weeklyRows} weeks={weeklyColumns} showSearch={false} />
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
                        <p className="font-semibold text-foreground">
                          {count?.qtyNumeric ?? "—"} {count?.qtyUnit ?? item.unit}
                        </p>
                        <Badge variant="outline" className="border-chart-4/40 text-chart-4">
                          Low
                        </Badge>
                      </div>
                    </div>
                  )
                })
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
