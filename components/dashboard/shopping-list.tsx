"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FileText, ImageDown, ShoppingCart } from "lucide-react"
import { toPng } from "html-to-image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type ShoppingListItem = {
  id: string
  name: string
  current: number
  threshold: number
  unit: string
  category: string
}

type ShoppingListOverride = {
  item_id: string
  desired_qty: number | null
  unit_price: number | null
  notes?: string | null
}

type DraftRow = {
  qty: string
  price: string
}

const currency = new Intl.NumberFormat("en-KE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const parseNumber = (value: string) => {
  const normalized = value.trim()
  if (!normalized) return null
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

const formatKes = (value: number) => `KES ${currency.format(value)}`

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

export function ShoppingList({
  items,
  overrides,
}: {
  items: ShoppingListItem[]
  overrides: ShoppingListOverride[]
}) {
  const captureRef = useRef<HTMLDivElement | null>(null)
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({})
  const supabase = useMemo(() => createClient(), [])

  const overrideMap = useMemo(() => {
    const map = new Map<string, ShoppingListOverride>()
    overrides.forEach((row) => map.set(row.item_id, row))
    return map
  }, [overrides])

  useEffect(() => {
    setDrafts((prev) => {
      const next: Record<string, DraftRow> = {}
      items.forEach((item) => {
        const existing = prev[item.id]
        if (existing) {
          next[item.id] = existing
          return
        }
        const override = overrideMap.get(item.id)
        const suggestedQty = Math.max(
          0,
          item.threshold > 0 ? item.threshold - item.current : 0
        )
        const defaultQty =
          override?.desired_qty ?? (item.current <= 0 ? Math.max(1, suggestedQty) : suggestedQty)
        next[item.id] = {
          qty: defaultQty ? String(defaultQty) : "",
          price:
            override?.unit_price != null ? String(override.unit_price) : "",
        }
      })
      return next
    })
  }, [items, overrideMap])

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aOut = a.current <= 0
      const bOut = b.current <= 0
      if (aOut !== bOut) return aOut ? -1 : 1
      const ratioA = a.threshold > 0 ? a.current / a.threshold : Number.POSITIVE_INFINITY
      const ratioB = b.threshold > 0 ? b.current / b.threshold : Number.POSITIVE_INFINITY
      if (ratioA !== ratioB) return ratioA - ratioB
      return a.name.localeCompare(b.name)
    })
  }, [items])

  const rows = useMemo(() => {
    return sortedItems.map((item) => {
      const draft = drafts[item.id]
      const override = overrideMap.get(item.id)
      const suggestedQty = Math.max(
        0,
        item.threshold > 0 ? item.threshold - item.current : 0
      )
      const fallbackQty =
        override?.desired_qty ??
        (item.current <= 0 ? Math.max(1, suggestedQty) : suggestedQty)
      const qtyValue = parseNumber(draft?.qty ?? "") ?? fallbackQty
      const priceValue =
        parseNumber(draft?.price ?? "") ?? override?.unit_price ?? 0
      const amount = qtyValue * priceValue
      return {
        ...item,
        status: item.current <= 0 ? "Out of stock" : "Low stock",
        qtyValue,
        priceValue,
        amount,
      }
    })
  }, [sortedItems, drafts, overrideMap])

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [rows]
  )

  const handleFieldChange = (
    itemId: string,
    field: keyof DraftRow,
    value: string
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: {
        qty: prev[itemId]?.qty ?? "",
        price: prev[itemId]?.price ?? "",
        [field]: value,
      },
    }))
  }

  const handleSaveRow = async (itemId: string) => {
    const draft = drafts[itemId]
    if (!draft) return
    const desiredQty = parseNumber(draft.qty) ?? 0
    const unitPrice = parseNumber(draft.price)

    await supabase
      .from("shopping_list_items")
      .upsert(
        {
          item_id: itemId,
          desired_qty: desiredQty,
          unit_price: unitPrice ?? null,
        },
        { onConflict: "item_id" }
      )

    setDrafts((prev) => ({
      ...prev,
      [itemId]: {
        qty: String(desiredQty),
        price: unitPrice != null ? String(unitPrice) : "",
      },
    }))
  }

  const handleExportPdf = () => {
    const logoUrl = `${window.location.origin}/marketing_13593461.png`
    const reportDate = new Date().toLocaleString()
    const rowsHtml = rows
      .map(
        (row) => `
        <tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.category)}</td>
          <td>${escapeHtml(row.status)}</td>
          <td>${escapeHtml(`${row.current} ${row.unit}`)}</td>
          <td class="align-right">${escapeHtml(
            currency.format(row.qtyValue)
          )}</td>
          <td class="align-right">${escapeHtml(
            currency.format(row.priceValue)
          )}</td>
          <td class="align-right">${escapeHtml(
            currency.format(row.amount)
          )}</td>
        </tr>
      `
      )
      .join("")

    const html = `
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
            body { margin: 0; background: #0a0a0b; color: #f4f4f5; }
            .page { padding: 32px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2a2a2f; padding-bottom: 16px; }
            .logo { display: flex; gap: 12px; align-items: center; }
            .logo img { width: 40px; height: 40px; border-radius: 10px; }
            h1 { margin: 0; font-size: 20px; }
            .subtitle { margin-top: 4px; font-size: 12px; color: #a1a1aa; }
            .meta { text-align: right; font-size: 12px; color: #a1a1aa; }
            .summary { margin: 20px 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
            .card { border: 1px solid #2a2a2f; background: #141418; padding: 12px; border-radius: 12px; }
            .card span { display: block; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: .1em; }
            .card strong { font-size: 18px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px 12px; border-bottom: 1px solid #242428; font-size: 12px; text-align: left; }
            th { font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: .08em; }
            .align-right { text-align: right; }
            .footer { margin-top: 18px; color: #71717a; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="logo">
                <img src="${logoUrl}" alt="Nobles Lighthouse" />
                <div>
                  <h1>Nobles Lighthouse</h1>
                  <div class="subtitle">Shopping List Export</div>
                </div>
              </div>
              <div class="meta">
                <div>Total items: ${rows.length}</div>
                <div>Total spend: ${formatKes(total)}</div>
                <div>Generated: ${escapeHtml(reportDate)}</div>
              </div>
            </div>
            <div class="summary">
              <div class="card"><span>Out of stock</span><strong>${rows.filter((r) => r.current <= 0).length}</strong></div>
              <div class="card"><span>Low stock</span><strong>${rows.filter((r) => r.current > 0).length}</strong></div>
              <div class="card"><span>Estimated total</span><strong>${formatKes(total)}</strong></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Current</th>
                  <th class="align-right">Qty to Buy</th>
                  <th class="align-right">Unit Price</th>
                  <th class="align-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || "<tr><td colspan='7'>No items to purchase.</td></tr>"}
              </tbody>
            </table>
            <div class="footer">Generated ${escapeHtml(reportDate)}</div>
          </div>
        </body>
      </html>
    `

    const pdfWindow = window.open("", "_blank", "width=1100,height=900")
    if (!pdfWindow) return
    pdfWindow.document.open()
    pdfWindow.document.write(html)
    pdfWindow.document.close()
    pdfWindow.focus()
    setTimeout(() => pdfWindow.print(), 400)
  }

  const handleExportImage = async () => {
    if (!captureRef.current) return
    const dataUrl = await toPng(captureRef.current, {
      pixelRatio: 2,
      backgroundColor: "#0a0a0b",
    })
    const link = document.createElement("a")
    link.download = `shopping-list-${new Date().toISOString().slice(0, 10)}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-2/15 text-chart-2">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Shopping List
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Auto-filled from low and out-of-stock items.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              className="h-8 border-border px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportImage}
              className="h-8 border-border px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <ImageDown className="mr-2 h-4 w-4" />
              Export PNG
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div ref={captureRef} className="rounded-xl border border-border/60 bg-secondary/10 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Purchase Overview</p>
              <p className="text-[11px] text-muted-foreground">
                {rows.length} item{rows.length === 1 ? "" : "s"} to replenish
              </p>
            </div>
            <div className="text-sm font-semibold text-foreground">
              Estimated total: {formatKes(total)}
            </div>
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-lg border border-border/60 lg:block">
            <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.9fr] gap-3 border-b border-border/60 bg-background/60 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span>Item</span>
              <span>Category</span>
              <span>Status</span>
              <span>Current</span>
              <span>Qty</span>
              <span>Price</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="max-h-[360px] divide-y divide-border/60 overflow-y-auto bg-background/40">
              {rows.length === 0 ? (
                <div className="px-4 py-6 text-xs text-muted-foreground">
                  No low stock items right now.
                </div>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr_0.9fr] items-center gap-3 px-4 py-3 text-xs text-foreground"
                  >
                    <div>
                      <p className="font-medium text-foreground">{row.name}</p>
                      <p className="text-[11px] text-muted-foreground">{row.unit}</p>
                    </div>
                    <span className="text-muted-foreground">{row.category}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        row.current <= 0
                          ? "bg-chart-4/15 text-chart-4"
                          : "bg-chart-3/15 text-chart-3"
                      )}
                    >
                      {row.status}
                    </span>
                    <span className="text-muted-foreground">
                      {row.current} {row.unit}
                    </span>
                    <Input
                      value={drafts[row.id]?.qty ?? ""}
                      onChange={(event) =>
                        handleFieldChange(row.id, "qty", event.target.value)
                      }
                      onBlur={() => handleSaveRow(row.id)}
                      className="h-8 border-border bg-background/80 text-xs"
                      type="number"
                      min="0"
                    />
                    <Input
                      value={drafts[row.id]?.price ?? ""}
                      onChange={(event) =>
                        handleFieldChange(row.id, "price", event.target.value)
                      }
                      onBlur={() => handleSaveRow(row.id)}
                      className="h-8 border-border bg-background/80 text-xs"
                      type="number"
                      min="0"
                    />
                    <span className="text-right font-semibold text-foreground">
                      {currency.format(row.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3 lg:hidden">
            {rows.length === 0 ? (
              <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-4 text-xs text-muted-foreground">
                No low stock items right now.
              </div>
            ) : (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-border/60 bg-background/70 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{row.name}</p>
                      <p className="text-[11px] text-muted-foreground">{row.category}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        row.current <= 0
                          ? "bg-chart-4/15 text-chart-4"
                          : "bg-chart-3/15 text-chart-3"
                      )}
                    >
                      {row.status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <span>Current: {row.current} {row.unit}</span>
                    <span className="text-right">Amount: {currency.format(row.amount)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Input
                      value={drafts[row.id]?.qty ?? ""}
                      onChange={(event) =>
                        handleFieldChange(row.id, "qty", event.target.value)
                      }
                      onBlur={() => handleSaveRow(row.id)}
                      className="h-8 border-border bg-background/80 text-xs"
                      placeholder="Qty"
                      type="number"
                      min="0"
                    />
                    <Input
                      value={drafts[row.id]?.price ?? ""}
                      onChange={(event) =>
                        handleFieldChange(row.id, "price", event.target.value)
                      }
                      onBlur={() => handleSaveRow(row.id)}
                      className="h-8 border-border bg-background/80 text-xs"
                      placeholder="Price"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
