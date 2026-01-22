"use client"

import { useEffect, useState } from "react"
import { Download, FileText } from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { StockTable, type StockItem } from "./stock-table"
import { cn } from "@/lib/utils"

interface WeeklyTab {
  id: string
  label: string
  dateRange: string
  weekLabel: string
  weekDate: string
}

interface WeeklyTabsProps {
  tabs: WeeklyTab[]
  data: StockItem[]
}

export function WeeklyTabs({ tabs, data }: WeeklyTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[tabs.length - 1]?.id ?? "")

  useEffect(() => {
    if (!tabs.length) return
    if (!tabs.find((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[tabs.length - 1].id)
    }
  }, [tabs, activeTab])

  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0]

  const handleExport = () => {
    if (!active) return

    const headers = [
      "Item",
      "Category",
      "Unit",
      "Reorder Level",
      `Count (${active.weekLabel})`,
      "Status",
    ]

    const rows = data.map((item) => [
      item.item,
      item.category,
      item.unit,
      item.reorderLevel ?? "",
      item.weekData[active.weekLabel] ?? "",
      item.status,
    ])

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `weekly_snapshot_${active.weekDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")

  const handleExportPdf = () => {
    if (!active) return

    const totalItems = data.length
    const lowStockCount = data.filter((item) => item.status !== "in-stock").length
    const countedCount = data.filter(
      (item) => (item.weekData[active.weekLabel] ?? "").trim() !== ""
    ).length

    const logoUrl = `${window.location.origin}/fav.png`

    const rowsHtml = data
      .map((item, index) => {
        const statusClass =
          item.status === "in-stock"
            ? "status ok"
            : item.status === "low-stock"
              ? "status warn"
              : "status danger"
        const countValue = item.weekData[active.weekLabel] ?? ""
        return `
          <tr class="${index % 2 === 0 ? "row-even" : "row-odd"}">
            <td>${escapeHtml(item.item)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(item.unit)}</td>
            <td class="align-right">${escapeHtml(String(item.reorderLevel ?? ""))}</td>
            <td>${escapeHtml(String(countValue))}</td>
            <td><span class="${statusClass}">${escapeHtml(item.status.replace("-", " "))}</span></td>
          </tr>
        `
      })
      .join("")

    const reportDate = new Date().toLocaleDateString()
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Weekly Stocktake Snapshot</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');
            :root {
              color-scheme: light;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: 'Manrope', 'Geist', sans-serif;
              background: #f4f6f8;
              color: #0f172a;
            }
            .page {
              max-width: 920px;
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
            <div class="header">
              <div class="logo">
                <img src="${logoUrl}" alt="Nobles Lighthouse" />
                <div class="title">
                  <h1>Nobles Lighthouse</h1>
                  <p>Weekly Stocktake Snapshot</p>
                </div>
              </div>
              <div class="meta">
                <div class="range">Data Range: ${escapeHtml(active.dateRange)}</div>
                <div>Snapshot Date: ${escapeHtml(active.weekDate)}</div>
                <div>Report Date: ${escapeHtml(reportDate)}</div>
              </div>
            </div>

            <div class="cards">
              <div class="card">
                <span>Items tracked</span>
                <strong>${totalItems}</strong>
              </div>
              <div class="card">
                <span>Counts recorded</span>
                <strong>${countedCount}</strong>
              </div>
              <div class="card">
                <span>Attention needed</span>
                <strong>${lowStockCount}</strong>
              </div>
            </div>

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
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div class="footer">
              Generated ${new Date().toLocaleString()}
            </div>
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

  if (!tabs.length) {
    return (
      <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
        No weekly snapshots available.
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabsList className="flex w-full flex-wrap justify-center gap-2 bg-transparent h-auto p-0 md:w-auto md:justify-start md:flex-nowrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "flex-1 min-w-[120px] rounded-lg border border-border/60 px-3 py-2 text-xs",
                "data-[state=active]:border-chart-1 data-[state=active]:bg-secondary/20",
                "data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground",
                "hover:text-foreground transition-colors",
                "sm:relative sm:min-w-0 sm:flex-none sm:h-12 sm:rounded-none sm:border-0 sm:border-b-2 sm:border-transparent sm:px-6 sm:py-0",
                "sm:data-[state=active]:border-chart-1 sm:data-[state=active]:bg-transparent"
              )}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium sm:text-sm">{tab.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {tab.dateRange}
                </span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
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
            onClick={handleExport}
            className="h-8 border-border px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          <StockTable data={data} weeks={[tab.weekLabel]} showSearch={false} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
