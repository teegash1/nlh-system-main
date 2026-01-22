"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FileText, ImageDown, ShoppingCart, X } from "lucide-react"
import { toPng } from "html-to-image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type ShoppingListItem = {
  id: string
  name: string
  current: number
  threshold: number
  unit: string
  category: string
  source?: "low" | "manual"
}

type ShoppingListOverride = {
  item_id: string
  desired_qty: number | null
  unit_price: number | null
  notes?: string | null
  excluded?: boolean | null
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
  catalogItems,
}: {
  items: ShoppingListItem[]
  overrides: ShoppingListOverride[]
  catalogItems: ShoppingListItem[]
}) {
  const captureRef = useRef<HTMLDivElement | null>(null)
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({})
  const [listItems, setListItems] = useState<ShoppingListItem[]>(items)
  const [localOverrides, setLocalOverrides] =
    useState<ShoppingListOverride[]>(overrides)
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isMarkingDone, setIsMarkingDone] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setListItems(items)
    setLocalOverrides(overrides)
  }, [items, overrides])

  const overrideMap = useMemo(() => {
    const map = new Map<string, ShoppingListOverride>()
    localOverrides.forEach((row) => map.set(row.item_id, row))
    return map
  }, [localOverrides])

  useEffect(() => {
    setDrafts((prev) => {
      const next: Record<string, DraftRow> = {}
      listItems.forEach((item) => {
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
  }, [listItems, overrideMap])

  const sortedItems = useMemo(() => {
    return [...listItems].sort((a, b) => {
      const aOut = a.current <= 0
      const bOut = b.current <= 0
      if (aOut !== bOut) return aOut ? -1 : 1
      const ratioA = a.threshold > 0 ? a.current / a.threshold : Number.POSITIVE_INFINITY
      const ratioB = b.threshold > 0 ? b.current / b.threshold : Number.POSITIVE_INFINITY
      if (ratioA !== ratioB) return ratioA - ratioB
      return a.name.localeCompare(b.name)
    })
  }, [listItems])

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
      const isManual = item.source === "manual"
      const isLow =
        item.current <= 0 ||
        (item.threshold > 0 && item.current <= item.threshold)
      return {
        ...item,
        status: !isManual
          ? item.current <= 0
            ? "Out of stock"
            : "Low stock"
          : isLow
            ? item.current <= 0
              ? "Out of stock"
              : "Low stock"
            : "Manual",
        isManual,
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

  const availableItems = useMemo(() => {
    const existingIds = new Set(listItems.map((item) => item.id))
    return catalogItems.filter((item) => !existingIds.has(item.id))
  }, [catalogItems, listItems])

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

  const handleAddItem = async () => {
    if (!selectedItemId) return
    const item = catalogItems.find((entry) => entry.id === selectedItemId)
    if (!item) return

    const suggestedQty = Math.max(
      1,
      item.threshold > 0 ? item.threshold - item.current : 1
    )

    const { data, error } = await supabase
      .from("shopping_list_items")
      .upsert(
        {
          item_id: item.id,
          desired_qty: suggestedQty,
          unit_price: null,
          excluded: false,
        },
        { onConflict: "item_id" }
      )
      .select("item_id, desired_qty, unit_price")
      .maybeSingle()

    if (error) return

    setLocalOverrides((prev) => {
      const next = prev.filter((row) => row.item_id !== item.id)
      if (data) {
        next.push({
          item_id: data.item_id,
          desired_qty: data.desired_qty,
          unit_price: data.unit_price,
        })
      }
      return next
    })

    setListItems((prev) => [...prev, { ...item, source: "manual" }])
    setDrafts((prev) => ({
      ...prev,
      [item.id]: {
        qty: String(suggestedQty),
        price: "",
      },
    }))
    setSelectedItemId("")
  }

  const handleRemoveItem = async (itemId: string) => {
    const { data } = await supabase
      .from("shopping_list_items")
      .upsert(
        {
          item_id: itemId,
          desired_qty: 0,
          unit_price: null,
          excluded: true,
        },
        { onConflict: "item_id" }
      )
      .select("item_id, desired_qty, unit_price, excluded")
      .maybeSingle()

    setLocalOverrides((prev) => {
      const next = prev.filter((row) => row.item_id !== itemId)
      if (data) {
        next.push({
          item_id: data.item_id,
          desired_qty: data.desired_qty,
          unit_price: data.unit_price,
          excluded: data.excluded,
        })
      }
      return next
    })
    setListItems((prev) => prev.filter((item) => item.id !== itemId))
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  const fetchActiveListId = async () => {
    const { data } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    return data?.id ?? null
  }

  const ensureActiveListId = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id ?? null
    let listId = activeListId ?? (await fetchActiveListId())

    if (!listId) {
      const title = `Shopping List • ${new Date().toLocaleDateString("en-KE", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
      const { data: created, error } = await supabase
        .from("shopping_lists")
        .insert({
          title,
          status: "active",
          created_by: userId,
        })
        .select("id")
        .single()
      if (error) return null
      listId = created?.id ?? null
    }

    return listId
  }

  const handleSaveList = async () => {
    if (isSaving) return
    setIsSaving(true)
    setStatusMessage(null)

    const listId = await ensureActiveListId()

    if (!listId) {
      setIsSaving(false)
      return
    }

    await supabase.from("shopping_list_entries").delete().eq("list_id", listId)
    const entries = rows.map((row) => ({
      list_id: listId,
      item_id: row.id,
      item_name: row.name,
      category: row.category,
      unit: row.unit,
      current_qty: row.current,
      desired_qty: row.qtyValue ?? 0,
      unit_price: row.priceValue ?? null,
      status: row.status,
    }))

    if (entries.length > 0) {
      await supabase.from("shopping_list_entries").insert(entries)
    }

    setActiveListId(listId)
    setStatusMessage("Shopping list saved.")
    setIsSaving(false)
  }

  const handleMarkDone = async () => {
    if (isMarkingDone) return
    setIsMarkingDone(true)
    setStatusMessage(null)

    const listId = await ensureActiveListId()
    if (listId) {
      await supabase.from("shopping_list_entries").delete().eq("list_id", listId)
      const entries = rows.map((row) => ({
        list_id: listId,
        item_id: row.id,
        item_name: row.name,
        category: row.category,
        unit: row.unit,
        current_qty: row.current,
        desired_qty: row.qtyValue ?? 0,
        unit_price: row.priceValue ?? null,
        status: row.status,
      }))
      if (entries.length > 0) {
        await supabase.from("shopping_list_entries").insert(entries)
      }

      await supabase
        .from("shopping_lists")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
        })
        .eq("id", listId)
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id ?? null
    const countDate = new Date().toISOString().slice(0, 10)
    const stockRows = rows
      .filter((row) => Number(row.qtyValue) > 0)
      .map((row) => {
        const newQty = Number(row.current) + Number(row.qtyValue ?? 0)
        const unitLabel = row.unit ?? ""
        return {
          item_id: row.id,
          count_date: countDate,
          raw_value: unitLabel ? `${newQty} ${unitLabel}` : String(newQty),
          qty_numeric: newQty,
          qty_unit: unitLabel || null,
          source: "shopping_list",
          created_by: userId,
        }
      })

    if (stockRows.length > 0) {
      await supabase
        .from("stock_counts")
        .upsert(stockRows, { onConflict: "item_id,count_date" })
    }

    await supabase.from("shopping_list_items").delete().gte("desired_qty", 0)

    setLocalOverrides([])
    setDrafts({})
    setListItems((prev) => prev.filter((item) => item.source !== "manual"))
    setActiveListId(null)
    setStatusMessage("Marked as done. Shopping list cleared.")
    setIsMarkingDone(false)
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
          excluded: false,
        },
        { onConflict: "item_id" }
      )

    setLocalOverrides((prev) => {
      const next = prev.filter((row) => row.item_id !== itemId)
      next.push({
        item_id: itemId,
        desired_qty: desiredQty,
        unit_price: unitPrice ?? null,
        excluded: false,
      })
      return next
    })

    setDrafts((prev) => ({
      ...prev,
      [itemId]: {
        qty: String(desiredQty),
        price: unitPrice != null ? String(unitPrice) : "",
      },
    }))
  }

  const buildExportTemplate = ({
    variant = "default",
  }: {
    variant?: "default" | "compact"
  } = {}) => {
    const logoUrl = `${window.location.origin}/fav.png`
    const reportDate = new Date().toLocaleString()
    const variantClass = variant === "compact" ? "compact" : ""
    const rowsHtml = rows
      .map(
        (row) => `
        <tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.category)}</td>
          <td>${escapeHtml(row.status)}</td>
          <td>${escapeHtml(`${row.current} ${row.unit}`)}</td>
          <td class="align-right">${escapeHtml(currency.format(row.qtyValue))}</td>
          <td class="align-right">${escapeHtml(currency.format(row.priceValue))}</td>
          <td class="align-right">${escapeHtml(currency.format(row.amount))}</td>
        </tr>
      `
      )
      .join("")
    const styles = `
      * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
      body { margin: 0; background: #0a0a0b; color: #f4f4f5; -webkit-print-color-adjust: exact; color-adjust: exact; }
      .page { padding: 32px; max-width: 1000px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222229; padding-bottom: 16px; gap: 16px; }
      .logo { display: flex; gap: 12px; align-items: center; }
      .logo img { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; background: #111115; border: 1px solid #2a2a2f; }
      h1 { margin: 0; font-size: 20px; letter-spacing: -0.01em; }
      .subtitle { margin-top: 4px; font-size: 12px; color: #a1a1aa; }
      .meta { text-align: right; font-size: 12px; color: #a1a1aa; line-height: 1.5; }
      .summary { margin: 20px 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .card { border: 1px solid #24242a; background: linear-gradient(180deg, #131318 0%, #101014 100%); padding: 14px; border-radius: 14px; box-shadow: 0 10px 24px rgba(0,0,0,0.35); }
      .card span { display: block; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: .14em; }
      .card strong { font-size: 18px; }
      .table-card { border: 1px solid #24242a; border-radius: 14px; overflow: hidden; background: #0e0e12; box-shadow: 0 14px 32px rgba(0,0,0,0.4); }
      table { width: 100%; border-collapse: collapse; }
      thead { background: #0b0b0f; }
      th, td { padding: 11px 12px; border-bottom: 1px solid #1f1f25; font-size: 12px; text-align: left; }
      th { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: .12em; }
      tbody tr:last-child td { border-bottom: none; }
      .align-right { text-align: right; }
      .footer { margin-top: 18px; color: #71717a; font-size: 11px; }
      .page.compact { padding: 22px; max-width: 920px; }
      .page.compact h1 { font-size: 18px; }
      .page.compact .subtitle { font-size: 11px; }
      .page.compact .meta { font-size: 11px; }
      .page.compact .logo img { width: 34px; height: 34px; border-radius: 10px; }
      .page.compact .summary { gap: 8px; margin: 16px 0; }
      .page.compact .card { padding: 10px; border-radius: 12px; }
      .page.compact .card span { font-size: 10px; letter-spacing: .12em; }
      .page.compact .card strong { font-size: 16px; }
      .page.compact th, .page.compact td { padding: 8px 10px; font-size: 11px; }
      .page.compact th { font-size: 10px; letter-spacing: .1em; }
    `
    const body = `
      <div id="export-root" class="page ${variantClass}">
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
        <div class="table-card">
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
        </div>
        <div class="footer">Generated ${escapeHtml(reportDate)}</div>
      </div>
    `
    return { styles, body }
  }

  const handleExportPdf = () => {
    const { styles, body } = buildExportTemplate()
    const html = `
      <html>
        <head>
          <title>Shopping List</title>
          <style>${styles}</style>
        </head>
        <body>
          ${body}
        </body>
      </html>
    `

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    iframe.style.visibility = "hidden"
    document.body.appendChild(iframe)

    iframe.onload = () => {
      const win = iframe.contentWindow
      if (!win) return
      win.focus()
      win.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 500)
    }

    const doc = iframe.contentDocument
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
  }

  const handleExportImage = async () => {
    const isMobile = window.innerWidth < 768
    const { styles, body } = buildExportTemplate({
      variant: isMobile ? "compact" : "default",
    })
    const exportRoot = document.createElement("div")
    const baseWidth = captureRef.current?.getBoundingClientRect().width ?? 980
    const exportWidth = isMobile
      ? 900
      : Math.min(1100, Math.max(760, Math.round(baseWidth)))

    exportRoot.style.position = "fixed"
    exportRoot.style.left = "0"
    exportRoot.style.top = "0"
    exportRoot.style.width = `${exportWidth}px`
    exportRoot.style.background = "#0a0a0b"
    exportRoot.style.color = "#f4f4f5"
    exportRoot.style.pointerEvents = "none"
    exportRoot.style.opacity = "0"
    exportRoot.innerHTML = `<style>${styles}</style>${body}`
    document.body.appendChild(exportRoot)

    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    const logo = exportRoot.querySelector("img")
    if (logo && !logo.complete) {
      await new Promise((resolve) => {
        logo.onload = () => resolve(null)
        logo.onerror = () => resolve(null)
      })
    }

    await new Promise((resolve) => requestAnimationFrame(resolve))
    await new Promise((resolve) => requestAnimationFrame(resolve))

    const exportHeight =
      exportRoot.scrollHeight || exportRoot.getBoundingClientRect().height

    let dataUrl = ""
    try {
      dataUrl = await toPng(exportRoot, {
        pixelRatio: 2,
        backgroundColor: "#0a0a0b",
        width: exportWidth,
        height: exportHeight,
        cacheBust: true,
        style: { opacity: "1" },
      })
    } finally {
      document.body.removeChild(exportRoot)
    }
    const link = document.createElement("a")
    link.download = `shopping-list-${new Date().toISOString().slice(0, 10)}.png`
    link.href = dataUrl
    link.click()

  }

  return (
    <Card id="shopping-list" className="bg-card border-border">
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
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveList}
              disabled={isSaving}
              className="h-8 border-border px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isSaving ? "Saving..." : "Save List"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConfirmText("")
                setConfirmOpen(true)
              }}
              disabled={isMarkingDone}
              className="h-8 border-border px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isMarkingDone ? "Closing..." : "Mark Done"}
            </Button>
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
        {statusMessage && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {statusMessage}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={selectedItemId} onValueChange={setSelectedItemId}>
            <SelectTrigger className="w-full sm:w-[320px] bg-background/80 border-border text-foreground">
              <SelectValue placeholder="Add item to shopping list" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {availableItems.length === 0 ? (
                <SelectItem value="__none" disabled>
                  All items already listed
                </SelectItem>
              ) : (
                availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddItem}
            disabled={!selectedItemId}
            className="h-8 px-3 text-[11px] premium-btn"
          >
            Add Item
          </Button>
        </div>

        <div ref={captureRef} className="mt-4 rounded-xl border border-border/60 bg-secondary/10 p-4">
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
            <div
              data-export-scroll
              className="max-h-[360px] divide-y divide-border/60 overflow-y-auto bg-background/40"
            >
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
                        row.status === "Manual"
                          ? "bg-chart-2/15 text-chart-2"
                          : row.current <= 0
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveItem(row.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <span className="text-right font-semibold text-foreground">
                        {currency.format(row.amount)}
                      </span>
                    </div>
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
                        row.status === "Manual"
                          ? "bg-chart-2/15 text-chart-2"
                          : row.current <= 0
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveItem(row.id)}
                  >
                    <X className="mr-2 h-3 w-3" />
                    Remove from list
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Confirm shopping completion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              This will mark the shopping list as done and update stock counts
              with the purchased quantities.
            </p>
            <div>
              <p className="text-xs font-medium text-foreground">
                Type <span className="text-foreground">done</span> to confirm
              </p>
              <Input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                className="mt-2 border-border bg-secondary/40 text-sm"
                placeholder="done"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (confirmText.trim().toLowerCase() !== "done") return
                setConfirmOpen(false)
                await handleMarkDone()
              }}
              disabled={confirmText.trim().toLowerCase() !== "done" || isMarkingDone}
              className="premium-btn"
            >
              Confirm & Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
