"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Input } from "@/components/ui/input"

export type StockRow = {
  id: string
  name: string
  category: string
  unit: string
  reorder_level: number | null
  stock: number
  totalValue: number
}

export default function StockClient({ initialData }: { initialData: StockRow[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return initialData
    return initialData.filter((row) => {
      return (
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q)
      )
    })
  }, [initialData, query])

  return (
    <AppShell title="Stock Taking" subtitle="Live inventory from Supabase">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Stock</h1>
            <p className="text-sm text-muted-foreground">
              Live inventory synced from Supabase
            </p>
          </div>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search items..."
            className="w-full md:w-80 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="border-b border-border p-4 grid grid-cols-6 gap-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <div className="col-span-2">Item</div>
            <div>Category</div>
            <div>Stock</div>
            <div>Unit</div>
            <div className="text-right">Total Value</div>
          </div>

          <div className="p-4 space-y-3">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-6 gap-4 text-sm items-center"
              >
                <div className="col-span-2 font-medium text-foreground">
                  {row.name}
                </div>
                <div className="text-muted-foreground">{row.category}</div>
                <div className="text-foreground">
                  {Number.isFinite(row.stock) ? row.stock.toLocaleString() : "0"}
                </div>
                <div className="text-muted-foreground">{row.unit}</div>
                <div className="text-right font-medium text-foreground">
                  KES{" "}
                  {Number.isFinite(row.totalValue)
                    ? row.totalValue.toLocaleString()
                    : "0"}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No items found.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
