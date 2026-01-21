"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ClipboardList, FileText } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ShoppingListHistory = {
  id: string
  title: string
  status: string
  created_at: string
  completed_at: string | null
}

type ShoppingListEntry = {
  list_id: string
  item_name: string
  category: string
  unit: string
  current_qty: number
  desired_qty: number
  unit_price: number | null
  status: string
}

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

const formatKes = (value: number) =>
  `KES ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)}`

export function ShoppingListHistoryTable({
  lists,
  entries,
}: {
  lists: ShoppingListHistory[]
  entries: ShoppingListEntry[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const entryMap = useMemo(() => {
    const map = new Map<string, ShoppingListEntry[]>()
    entries.forEach((entry) => {
      const listEntries = map.get(entry.list_id) ?? []
      listEntries.push(entry)
      map.set(entry.list_id, listEntries)
    })
    return map
  }, [entries])

  const summaries = useMemo(() => {
    return lists.map((list) => {
      const listEntries = entryMap.get(list.id) ?? []
      const total = listEntries.reduce((sum, row) => {
        const line = Number(row.desired_qty || 0) * Number(row.unit_price || 0)
        return sum + (Number.isFinite(line) ? line : 0)
      }, 0)
      return {
        ...list,
        entries: listEntries,
        total,
      }
    })
  }, [lists, entryMap])

  const activeSummary = summaries.find((list) => list.id === activeListId) ?? null

  const handleOpen = (listId: string) => {
    setActiveListId(listId)
    setOpen(true)
  }

  const handleLoad = async () => {
    if (!activeListId) return
    setIsLoading(true)
    await fetch("/api/shopping-lists/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId: activeListId }),
    })
    setIsLoading(false)
    setOpen(false)
    router.push("/dashboard#shopping-list")
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Shopping List History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summaries.length === 0 ? (
          <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
            No shopping lists saved yet.
          </div>
        ) : (
          <>
            <div className="hidden items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:grid md:grid-cols-[1.6fr_110px_110px_140px]">
              <span>List</span>
              <span>Status</span>
              <span>Items</span>
              <span>Total</span>
            </div>
            <div className="space-y-3">
              {summaries.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleOpen(list.id)}
                  className="w-full rounded-xl border border-border bg-secondary/20 p-4 text-left transition-colors hover:border-accent"
                >
                  <div className="hidden md:grid md:grid-cols-[1.6fr_110px_110px_140px] md:items-center md:gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {list.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatShortDate(list.created_at)}</span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        list.status === "done"
                          ? "bg-chart-2/15 text-chart-2"
                          : "bg-chart-3/15 text-chart-3"
                      )}
                    >
                      {list.status === "done" ? "Done" : "Active"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {list.entries.length}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {formatKes(list.total)}
                    </span>
                  </div>

                  <div className="space-y-3 md:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground break-words">
                          {list.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatShortDate(list.created_at)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          list.status === "done"
                            ? "bg-chart-2/15 text-chart-2"
                            : "bg-chart-3/15 text-chart-3"
                        )}
                      >
                        {list.status === "done" ? "Done" : "Active"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{list.entries.length} items</span>
                      <span className="text-foreground font-semibold">
                        {formatKes(list.total)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {activeSummary?.title ?? "Shopping List"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {activeSummary ? formatShortDate(activeSummary.created_at) : "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span>{activeSummary?.entries.length ?? 0} items</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  {activeSummary ? formatKes(activeSummary.total) : "KES 0"}
                </span>
              </div>
            </div>

            <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-secondary/10 p-3">
              {(activeSummary?.entries ?? []).length === 0 ? (
                <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-4 text-xs text-muted-foreground">
                  No entries saved for this list.
                </div>
              ) : (
                activeSummary?.entries.map((entry, index) => (
                  <div
                    key={`${entry.item_name}-${index}`}
                    className="rounded-lg border border-border/60 bg-background/70 p-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {entry.item_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {entry.category} • {entry.unit}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {entry.status}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                      <span>Current: {entry.current_qty}</span>
                      <span>Qty: {entry.desired_qty}</span>
                      <span>Price: {formatKes(entry.unit_price ?? 0)}</span>
                      <span className="text-right text-foreground font-semibold">
                        {formatKes(
                          Number(entry.desired_qty || 0) *
                            Number(entry.unit_price || 0)
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
            <Button onClick={handleLoad} disabled={isLoading} className="premium-btn">
              {isLoading ? "Loading..." : "Load to Shopping List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
