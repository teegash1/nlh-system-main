"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Input } from "@/components/ui/input"
import { CategoryFilter } from "@/components/stock/category-filter"
import { AddItemDialog } from "@/components/stock/add-item-dialog"
import { AddCountDialog } from "@/components/stock/add-count-dialog"
import { CountsTable, type StockCountRow } from "@/components/stock/counts-table"
import { ItemsTable, type StockItemRow } from "@/components/stock/items-table"

export type StockRow = {
  id: string
  name: string
  category: string
  unit: string
  reorder_level: number | null
  asOf: string | null
  displayValue: string
}

export default function StockClient({
  initialData,
  categories,
  items,
  counts,
}: {
  initialData: StockRow[]
  categories: string[]
  items: { id: string; name: string; unit: string }[]
  counts: StockCountRow[]
}) {
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const latestStocktake =
    initialData.find((row) => row.asOf)?.asOf ?? "—"

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

  return (
    <AppShell title="Stock Taking" subtitle="Live inventory from Supabase">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Stock</h1>
            <p className="text-sm text-muted-foreground">
              Live inventory synced from Supabase
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Latest Stocktake: {latestStocktake}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
            <AddItemDialog categories={categories} />
            <AddCountDialog items={items} />
          </div>
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
            <div className="text-xs text-muted-foreground">
              Filtered: {itemRows.length} items
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
              Latest Date: {latestStocktake}
            </div>
          </div>
          <CountsTable counts={counts} />
        </div>
      </div>
    </AppShell>
  )
}
