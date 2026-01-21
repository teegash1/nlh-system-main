"use client"

import { useState } from "react"
import { Download, FileText, Sheet } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

type ReportType =
  | "weekly-stock"
  | "monthly-expense"
  | "inventory-valuation"
  | "usage-trends"

interface ReportExportMenuProps {
  reportType: ReportType
  reportTitle: string
}

type WeeklyReport = {
  meta: {
    reportTitle: string
    periodLabel: string | null
    periodStart: string | null
    periodEnd: string | null
    reportDate: string
  }
  summary: {
    totalItems: number
    countedItems: number
    lowStockItems: number
    outOfStockItems: number
  }
  rows: Array<{
    item: string
    category: string
    unit: string
    reorderLevel: number | null
    rawValue: string
    qtyNumeric: number | null
    status: string
  }>
}

type MonthlyExpenseReport = {
  meta: {
    reportTitle: string
    periodLabel: string | null
    periodStart: string | null
    periodEnd: string | null
    reportDate: string
  }
  summary: {
    totalSpend: number
    receiptCount: number
    topCategory: string | null
  }
  categories: Array<{ category: string; total: number }>
  receipts: Array<{
    date: string
    shoper: string
    category: string
    amount: number
    paymentMethod: string
    status: string
  }>
}

type InventoryValuationReport = {
  meta: {
    reportTitle: string
    periodLabel: string | null
    periodStart: string | null
    periodEnd: string | null
    reportDate: string
  }
  summary: {
    totalItems: number
    valuedItems: number
    totalValue: number
  }
  rows: Array<{
    item: string
    category: string
    unit: string
    quantity: number | null
    unitCost: number | null
    value: number | null
  }>
}

type UsageTrendsReport = {
  meta: {
    reportTitle: string
    periodLabel: string | null
    periodStart: string | null
    periodEnd: string | null
    reportDate: string
  }
  summary: {
    totalUsage: number
    topItem: string | null
  }
  weeklyUsage: Array<{ weekLabel: string; total: number }>
  topItems: Array<{ item: string; category: string; total: number }>
}

type ReportPayload =
  | WeeklyReport
  | MonthlyExpenseReport
  | InventoryValuationReport
  | UsageTrendsReport

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 2,
})

const numberFormat = new Intl.NumberFormat("en-KE")

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const buildHtmlShell = (body: string) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Nobles Lighthouse Report</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: 'Manrope', 'Geist', sans-serif;
        background: #f4f6f8;
        color: #0f172a;
      }
      .page {
        max-width: 980px;
        margin: 32px auto;
        background: #ffffff;
        border-radius: 18px;
        padding: 32px;
        border: 1px solid #e2e8f0;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 16px;
      }
      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .logo img {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      .title h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
      }
      .title p {
        margin: 4px 0 0;
        font-size: 12px;
        color: #64748b;
      }
      .meta {
        text-align: right;
        font-size: 12px;
        color: #475569;
      }
      .meta .range {
        font-weight: 600;
        color: #0f172a;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin: 20px 0;
      }
      .card {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px;
        background: #f8fafc;
      }
      .card span {
        display: block;
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .card strong {
        font-size: 18px;
        margin-top: 6px;
        display: block;
      }
      .section {
        margin-top: 18px;
      }
      .section h2 {
        font-size: 14px;
        margin: 0 0 8px;
        color: #0f172a;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      thead th {
        text-align: left;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #64748b;
        padding: 10px;
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
      }
      tbody td {
        padding: 10px;
        border-bottom: 1px solid #e2e8f0;
      }
      .row-even { background: #ffffff; }
      .row-odd { background: #f8fafc; }
      .align-right { text-align: right; }
      .status {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 600;
      }
      .status.ok { background: #e6f5ef; color: #0f766e; }
      .status.warn { background: #fef3c7; color: #b45309; }
      .status.danger { background: #fee2e2; color: #b91c1c; }
      .footer {
        margin-top: 18px;
        font-size: 10px;
        color: #94a3b8;
        text-align: right;
      }
      @media print {
        body { background: #ffffff; }
        .page { margin: 0; border: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      ${body}
    </div>
  </body>
</html>
`

const buildHeader = (title: string, meta: WeeklyReport["meta"]) => {
  const logoUrl = `${window.location.origin}/marketing_13593461.png`
  return `
    <div class="header">
      <div class="logo">
        <img src="${logoUrl}" alt="Nobles Lighthouse" />
        <div class="title">
          <h1>Nobles Lighthouse</h1>
          <p>${escapeHtml(title)}</p>
        </div>
      </div>
      <div class="meta">
        <div class="range">Data Range: ${escapeHtml(meta.periodLabel ?? "—")}</div>
        <div>Report Date: ${escapeHtml(meta.reportDate)}</div>
      </div>
    </div>
  `
}

const openPdf = (html: string) => {
  const pdfWindow = window.open("", "_blank", "width=1100,height=900")
  if (!pdfWindow) return
  pdfWindow.document.open()
  pdfWindow.document.write(html)
  pdfWindow.document.close()
  pdfWindow.focus()
  setTimeout(() => pdfWindow.print(), 400)
}

const toCsv = (rows: string[][]) =>
  rows
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")

export function ReportExportMenu({ reportType, reportTitle }: ReportExportMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [range, setRange] = useState<{
    from?: Date
    to?: Date
  }>({})
  const isRangeComplete = Boolean(range.from && range.to)

  const rangeLabel =
    range.from && range.to
      ? `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`
      : "Custom range"

  const fetchReport = async () => {
    let url = `/api/reports/${reportType}`
    if (reportType === "monthly-expense" && range.from && range.to) {
      const from = format(range.from, "yyyy-MM-dd")
      const to = format(range.to, "yyyy-MM-dd")
      url = `${url}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    }
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) {
      throw new Error("Unable to fetch report data.")
    }
    const payload = await res.json()
    if (!payload?.data) throw new Error("Report data missing.")
    return payload.data as ReportPayload
  }

  const handlePdf = async () => {
    try {
      setIsLoading(true)
      const data = await fetchReport()
      const meta = data.meta
      const header = buildHeader(reportTitle, meta)

      if (reportType === "weekly-stock") {
        const weekly = data as WeeklyReport
        const summary = `
          <div class="cards">
            <div class="card"><span>Total items</span><strong>${weekly.summary.totalItems}</strong></div>
            <div class="card"><span>Counts recorded</span><strong>${weekly.summary.countedItems}</strong></div>
            <div class="card"><span>Low/out stock</span><strong>${weekly.summary.lowStockItems + weekly.summary.outOfStockItems}</strong></div>
          </div>
        `
        const rowsHtml = weekly.rows
          .map((row, index) => {
            const statusClass =
              row.status === "out-of-stock"
                ? "status danger"
                : row.status === "low-stock"
                  ? "status warn"
                  : "status ok"
            return `
              <tr class="${index % 2 === 0 ? "row-even" : "row-odd"}">
                <td>${escapeHtml(row.item)}</td>
                <td>${escapeHtml(row.category)}</td>
                <td>${escapeHtml(row.unit)}</td>
                <td class="align-right">${escapeHtml(String(row.reorderLevel ?? ""))}</td>
                <td>${escapeHtml(row.rawValue)}</td>
                <td><span class="${statusClass}">${escapeHtml(row.status.replace("-", " "))}</span></td>
              </tr>
            `
          })
          .join("")
        const body = `
          ${header}
          ${summary}
          <div class="section">
            <h2>Weekly Stock Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th class="align-right">Reorder</th>
                  <th>Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <div class="footer">Generated ${escapeHtml(meta.reportDate)}</div>
        `
        openPdf(buildHtmlShell(body))
      }

      if (reportType === "monthly-expense") {
        const monthly = data as MonthlyExpenseReport
        const summary = `
          <div class="cards">
            <div class="card"><span>Total spend</span><strong>${currency.format(monthly.summary.totalSpend)}</strong></div>
            <div class="card"><span>Receipts logged</span><strong>${monthly.summary.receiptCount}</strong></div>
            <div class="card"><span>Top category</span><strong>${escapeHtml(monthly.summary.topCategory ?? "—")}</strong></div>
          </div>
        `
        const categoryRows = monthly.categories
          .map((row, index) => `
            <tr class="${index % 2 === 0 ? "row-even" : "row-odd"}">
              <td>${escapeHtml(row.category)}</td>
              <td class="align-right">${currency.format(row.total)}</td>
            </tr>
          `)
          .join("")
        const receiptRows = monthly.receipts
          .map((row, index) => `
            <tr class="${index % 2 === 0 ? "row-even" : "row-odd"}">
              <td>${escapeHtml(row.date)}</td>
              <td>${escapeHtml(row.shoper)}</td>
              <td>${escapeHtml(row.category)}</td>
              <td class="align-right">${currency.format(row.amount)}</td>
              <td>${escapeHtml(row.paymentMethod)}</td>
              <td>${escapeHtml(row.status)}</td>
            </tr>
          `)
          .join("")
        const body = `
          ${header}
          ${summary}
          <div class="section">
            <h2>Spend by Category</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th class="align-right">Total</th>
                </tr>
              </thead>
              <tbody>${categoryRows}</tbody>
            </table>
          </div>
          <div class="section">
            <h2>Receipts (Month)</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shoper</th>
                  <th>Category</th>
                  <th class="align-right">Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${receiptRows}</tbody>
            </table>
          </div>
          <div class="footer">Generated ${escapeHtml(meta.reportDate)}</div>
        `
        openPdf(buildHtmlShell(body))
      }

      if (reportType === "inventory-valuation") {
        const valuation = data as InventoryValuationReport
        const summary = `
          <div class="cards">
            <div class="card"><span>Total items</span><strong>${valuation.summary.totalItems}</strong></div>
            <div class="card"><span>Valued items</span><strong>${valuation.summary.valuedItems}</strong></div>
            <div class="card"><span>Total value</span><strong>${currency.format(valuation.summary.totalValue)}</strong></div>
          </div>
        `
        const rowsHtml = valuation.rows
          .map((row, index) => `
            <tr class="${index % 2 === 0 ? "row-even" : "row-odd"}">
              <td>${escapeHtml(row.item)}</td>
              <td>${escapeHtml(row.category)}</td>
              <td>${escapeHtml(row.unit)}</td>
              <td class="align-right">${row.quantity == null ? "—" : numberFormat.format(row.quantity)}</td>
              <td class="align-right">${row.unitCost == null ? "—" : currency.format(row.unitCost)}</td>
              <td class="align-right">${row.value == null ? "—" : currency.format(row.value)}</td>
            </tr>
          `)
          .join("")
        const body = `
          ${header}
          ${summary}
          <div class="section">
            <h2>Valuation Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th class="align-right">Quantity</th>
                  <th class="align-right">Unit Cost</th>
                  <th class="align-right">Value</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <div class="footer">Generated ${escapeHtml(meta.reportDate)}</div>
        `
        openPdf(buildHtmlShell(body))
      }

      if (reportType === "usage-trends") {
        const usage = data as UsageTrendsReport
        const summary = `
          <div class="cards">
            <div class="card"><span>Total usage</span><strong>${numberFormat.format(usage.summary.totalUsage)}</strong></div>
            <div class="card"><span>Top item</span><strong>${escapeHtml(usage.summary.topItem ?? "—")}</strong></div>
            <div class="card"><span>Weeks tracked</span><strong>${usage.weeklyUsage.length}</strong></div>
          </div>
        `
        const weeklyRows = usage.weeklyUsage
          .map((row, index) => `
            <tr class="${index % 2 === 0 ? "row-even" : "row-odd"}">
              <td>${escapeHtml(row.weekLabel)}</td>
              <td class="align-right">${numberFormat.format(row.total)}</td>
            </tr>
          `)
          .join("")
        const topRows = usage.topItems
          .map((row, index) => `
            <tr class="${index % 2 === 0 ? "row-even" : "row-odd"}">
              <td>${escapeHtml(row.item)}</td>
              <td>${escapeHtml(row.category)}</td>
              <td class="align-right">${numberFormat.format(row.total)}</td>
            </tr>
          `)
          .join("")
        const body = `
          ${header}
          ${summary}
          <div class="section">
            <h2>Weekly Usage</h2>
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  <th class="align-right">Total Out</th>
                </tr>
              </thead>
              <tbody>${weeklyRows}</tbody>
            </table>
          </div>
          <div class="section">
            <h2>Top Consumed Items</h2>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th class="align-right">Total Out</th>
                </tr>
              </thead>
              <tbody>${topRows}</tbody>
            </table>
          </div>
          <div class="footer">Generated ${escapeHtml(meta.reportDate)}</div>
        `
        openPdf(buildHtmlShell(body))
      }
    } catch (error) {
      window.alert("Unable to export report data right now.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCsv = async () => {
    try {
      setIsLoading(true)
      const data = await fetchReport()

      if (reportType === "weekly-stock") {
        const weekly = data as WeeklyReport
        const rows = [
          ["Item", "Category", "Unit", "Reorder Level", "Raw Count", "Numeric", "Status"],
          ...weekly.rows.map((row) => [
            row.item,
            row.category,
            row.unit,
            row.reorderLevel ?? "",
            row.rawValue,
            row.qtyNumeric ?? "",
            row.status,
          ]),
        ]
        downloadCsv(rows, `${reportTitle}_${weekly.meta.reportDate}`)
      }

      if (reportType === "monthly-expense") {
        const monthly = data as MonthlyExpenseReport
        const rows = [
          ["Date", "Shoper", "Category", "Amount", "Payment Method", "Status"],
          ...monthly.receipts.map((row) => [
            row.date,
            row.shoper,
            row.category,
            row.amount,
            row.paymentMethod,
            row.status,
          ]),
        ]
        downloadCsv(rows, `${reportTitle}_${monthly.meta.reportDate}`)
      }

      if (reportType === "inventory-valuation") {
        const valuation = data as InventoryValuationReport
        const rows = [
          ["Item", "Category", "Unit", "Quantity", "Unit Cost", "Value"],
          ...valuation.rows.map((row) => [
            row.item,
            row.category,
            row.unit,
            row.quantity ?? "",
            row.unitCost ?? "",
            row.value ?? "",
          ]),
        ]
        downloadCsv(rows, `${reportTitle}_${valuation.meta.reportDate}`)
      }

      if (reportType === "usage-trends") {
        const usage = data as UsageTrendsReport
        const rows = [
          ["Week", "Total Out"],
          ...usage.weeklyUsage.map((row) => [row.weekLabel, row.total]),
          [],
          ["Item", "Category", "Total Out"],
          ...usage.topItems.map((row) => [row.item, row.category, row.total]),
        ]
        downloadCsv(rows, `${reportTitle}_${usage.meta.reportDate}`)
      }
    } catch (error) {
      window.alert("Unable to export report data right now.")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCsv = (rows: string[][], filename: string) => {
    const csvContent = toCsv(rows)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename.replace(/\s+/g, "_")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadButton = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between border-border text-muted-foreground hover:text-foreground hover:bg-accent premium-btn bg-transparent sm:w-auto"
          disabled={isLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          {isLoading ? "Preparing..." : "Download"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem
          onClick={handlePdf}
          className="text-muted-foreground hover:text-foreground focus:text-foreground"
        >
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCsv}
          className="text-muted-foreground hover:text-foreground focus:text-foreground"
        >
          <Sheet className="mr-2 h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (reportType !== "monthly-expense") {
    return downloadButton
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Popover
        open={rangeOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isRangeComplete) {
            setRangeOpen(true)
            return
          }
          setRangeOpen(nextOpen)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between border-border text-muted-foreground hover:text-foreground hover:bg-accent premium-btn bg-transparent sm:w-auto"
          >
            {rangeLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-card border-border"
          align="end"
          onInteractOutside={(event) => {
            if (!isRangeComplete) {
              event.preventDefault()
            }
          }}
          onEscapeKeyDown={(event) => {
            if (!isRangeComplete) {
              event.preventDefault()
            }
          }}
        >
          <Calendar
            initialFocus
            mode="range"
            selected={{ from: range.from, to: range.to }}
            defaultMonth={range.from}
            onSelect={(nextRange) => {
              const from = nextRange?.from
              const to = nextRange?.to
              setRange({ from, to })
              if (from && to) {
                setRangeOpen(false)
              }
            }}
            numberOfMonths={2}
            className="bg-card"
          />
          <div className="px-4 pb-4 text-[11px] text-muted-foreground">
            Select a custom date window for the monthly expense report.
          </div>
        </PopoverContent>
      </Popover>
      {downloadButton}
    </div>
  )
}
