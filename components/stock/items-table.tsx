"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteItem } from "@/app/stock/actions"
import { EditItemDialog } from "@/components/stock/edit-item-dialog"

export interface StockItemRow {
  id: string
  name: string
  category: string
  unit: string
  reorderLevel: number | null
  latestCount: string
  asOf: string | null
}

interface ItemsTableProps {
  items: StockItemRow[]
  categories: string[]
}

export function ItemsTable({ items, categories }: ItemsTableProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Archive this item? It will be hidden.")
    if (!confirmed) return

    const payload = new FormData()
    payload.set("id", id)
    startTransition(async () => {
      await deleteItem(payload)
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
        No inventory items yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="hidden items-center gap-3 border-b border-border bg-secondary/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:grid md:grid-cols-[1.4fr_1fr_100px_120px_120px_150px]">
        <span>Item</span>
        <span>Category</span>
        <span>Unit</span>
        <span>Reorder</span>
        <span>Latest</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1.4fr_1fr_100px_120px_120px_150px] md:items-center"
          >
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Latest date: {item.asOf ?? "—"}
              </p>
            </div>
            <div className="text-muted-foreground">{item.category}</div>
            <div className="text-muted-foreground">{item.unit}</div>
            <div className="text-muted-foreground">
              {item.reorderLevel ?? "—"}
            </div>
            <div className="text-foreground">{item.latestCount}</div>
            <div className="flex flex-wrap gap-2">
              <EditItemDialog
                item={{
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  unit: item.unit,
                  reorderLevel: item.reorderLevel,
                }}
                categories={categories}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleDelete(item.id)}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
