"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteStockCount } from "@/app/stock/actions"
import { EditCountDialog } from "@/components/stock/edit-count-dialog"

export interface StockCountRow {
  id: string
  itemId: string
  itemName: string
  countDate: string
  rawValue: string
  qtyNumeric: number | null
  qtyUnit: string | null
}

interface CountsTableProps {
  counts: StockCountRow[]
}

export function CountsTable({ counts }: CountsTableProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Delete this stock count entry?")
    if (!confirmed) return

    const payload = new FormData()
    payload.set("id", id)
    startTransition(async () => {
      await deleteStockCount(payload)
    })
  }

  if (counts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
        No counts recorded for the latest stocktake date yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="hidden items-center gap-3 border-b border-border bg-secondary/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:grid md:grid-cols-[1.4fr_1fr_1.4fr_120px_140px]">
        <span>Item</span>
        <span>Date</span>
        <span>Raw Count</span>
        <span>Numeric</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-border">
        {counts.map((count) => (
          <div
            key={count.id}
            className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1.4fr_1fr_1.4fr_120px_140px] md:items-center"
          >
            <div>
              <p className="font-medium text-foreground">{count.itemName}</p>
              <p className="text-[11px] text-muted-foreground">
                {count.qtyUnit || "unit not set"}
              </p>
            </div>
            <div className="text-muted-foreground">{count.countDate}</div>
            <div className="text-foreground">{count.rawValue}</div>
            <div className="text-muted-foreground">
              {count.qtyNumeric ?? "—"}
            </div>
            <div className="flex flex-wrap gap-2">
              <EditCountDialog count={count} />
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleDelete(count.id)}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
