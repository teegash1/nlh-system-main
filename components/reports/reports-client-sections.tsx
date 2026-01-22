"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  DollarSign,
  Download,
  FileText,
  Package,
  TrendingUp,
  Upload,
} from "lucide-react"

const ReceiptUploadForm = dynamic(
  () =>
    import("@/components/reports/receipt-upload-form").then(
      (mod) => mod.ReceiptUploadForm
    ),
  { ssr: false, loading: () => <UploadFormSkeleton /> }
)
const ReceiptActions = dynamic(
  () =>
    import("@/components/reports/receipt-actions").then(
      (mod) => mod.ReceiptActions
    ),
  { ssr: false, loading: () => <ActionsSkeleton /> }
)
const ReceiptStatusSelect = dynamic(
  () =>
    import("@/components/reports/receipt-status-select").then(
      (mod) => mod.ReceiptStatusSelect
    ),
  { ssr: false, loading: () => <StatusSelectSkeleton /> }
)
const ReceiptsExportButton = dynamic(
  () =>
    import("@/components/reports/receipts-export-button").then(
      (mod) => mod.ReceiptsExportButton
    ),
  { ssr: false, loading: () => <ButtonSkeleton className="h-9 w-24" /> }
)
const CategoryManagerDialog = dynamic(
  () =>
    import("@/components/stock/category-manager-dialog").then(
      (mod) => mod.CategoryManagerDialog
    ),
  { ssr: false, loading: () => <ButtonSkeleton className="h-9 w-36" /> }
)
const ReportExportMenu = dynamic(
  () =>
    import("@/components/reports/report-export-menu").then(
      (mod) => mod.ReportExportMenu
    ),
  { ssr: false, loading: () => <ButtonSkeleton className="h-9 w-24" /> }
)
const ShoppingListHistoryTable = dynamic(
  () =>
    import("@/components/reports/shopping-list-history").then(
      (mod) => mod.ShoppingListHistoryTable
    ),
  { ssr: false, loading: () => <TableSkeleton /> }
)

type ReceiptEntry = {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  amountReceived: number | null
  balance: number | null
  previousBalance: number | null
  paymentMethod: string
  status: string
  reference: string | null
  viewUrl: string | null
  fileName: string | null
  createdAt: string
}

const reports = [
  {
    id: "1",
    reportType: "weekly-stock",
    title: "Weekly Stock Report",
    description: "Comprehensive weekly inventory analysis",
    date: "January 20, 2026",
    type: "Weekly",
    icon: Calendar,
    color: "chart-1",
  },
  {
    id: "2",
    reportType: "monthly-expense",
    title: "Monthly Expense Report",
    description: "Monthly spending breakdown by category",
    date: "January 1, 2026",
    type: "Monthly",
    icon: DollarSign,
    color: "chart-2",
  },
  {
    id: "3",
    reportType: "inventory-valuation",
    title: "Inventory Valuation",
    description: "Current stock value assessment",
    date: "January 15, 2026",
    type: "Quarterly",
    icon: Package,
    color: "chart-3",
  },
  {
    id: "4",
    reportType: "usage-trends",
    title: "Usage Trends Report",
    description: "Stock consumption patterns and trends",
    date: "December 31, 2025",
    type: "Annual",
    icon: TrendingUp,
    color: "chart-5",
  },
]

const paymentMethods = ["Cash", "Mobile Money", "Bank Transfer", "Card"]

const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const formatShortDate = (value: string) => {
  const [year, month, day] = value.split("-")
  const monthLabel = monthNamesShort[Number(month) - 1] ?? ""
  return `${monthLabel} ${Number(day)}, ${year}`
}

const ButtonSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-md bg-secondary/60 animate-pulse ${className}`} />
)

const UploadFormSkeleton = () => (
  <div className="space-y-3">
    <div className="h-9 rounded-md bg-secondary/60 animate-pulse" />
    <div className="h-9 rounded-md bg-secondary/60 animate-pulse" />
    <div className="h-9 rounded-md bg-secondary/60 animate-pulse" />
    <div className="h-24 rounded-md bg-secondary/60 animate-pulse" />
    <div className="h-9 rounded-md bg-secondary/60 animate-pulse" />
  </div>
)

const ActionsSkeleton = () => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="h-8 w-8 rounded-md bg-secondary/60 animate-pulse"
      />
    ))}
  </div>
)

const StatusSelectSkeleton = () => (
  <div className="h-8 w-[110px] rounded-md bg-secondary/60 animate-pulse" />
)

const TableSkeleton = () => (
  <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3 animate-pulse">
    <div className="h-4 w-40 rounded bg-secondary/60" />
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="h-10 rounded bg-secondary/50" />
    ))}
  </div>
)

export function ReportsClientSections({
  canUpdateStatus,
  receipts,
  receiptsByMonth,
  receiptCategories,
  categoryOptions,
  currentBalance,
  lastReceived,
  lastSpent,
  lastReceiptDate,
  shoppingLists,
  shoppingEntries,
}: {
  canUpdateStatus: boolean
  receipts: ReceiptEntry[]
  receiptsByMonth: Array<{ monthLabel: string; receipts: ReceiptEntry[] }>
  receiptCategories: string[]
  categoryOptions: { id: string; name: string }[]
  currentBalance: number | null
  lastReceived: number | null
  lastSpent: number | null
  lastReceiptDate: string | null
  shoppingLists: Array<{
    id: string
    title: string
    status: string
    created_at: string
    completed_at: string | null
  }>
  shoppingEntries: Array<{
    list_id: string
    item_name: string
    category: string
    unit: string
    current_qty: number
    desired_qty: number
    unit_price: number | null
    status: string
  }>
}) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="md:hidden">
        <h1 className="text-xl font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">
          View and download inventory reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border hover:border-accent transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-1/20">
              <FileText className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Generate Report</p>
              <p className="text-xs text-muted-foreground">Create new report</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-accent transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-2/20">
              <Calendar className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Schedule Report</p>
              <p className="text-xs text-muted-foreground">Automate reporting</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-accent transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-3/20">
              <Download className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Export All</p>
              <p className="text-xs text-muted-foreground">Download archive</p>
            </div>
          </CardContent>
        </Card>
        <Link href="/analytics" className="block">
          <Card className="bg-card border-border hover:border-accent transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chart-5/20">
                <TrendingUp className="h-6 w-6 text-chart-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Analytics</p>
                <p className="text-xs text-muted-foreground">View insights</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Reports</CardTitle>
          <CardDescription className="text-muted-foreground">
            Access your previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-3 rounded-xl bg-secondary/30 border border-border p-3 hover:border-accent transition-colors sm:flex-row sm:items-center sm:gap-4 sm:p-4"
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-${report.color}/20`}>
                  <report.icon className={`h-6 w-6 text-${report.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{report.title}</p>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                      {report.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{report.date}</span>
                  </div>
                </div>
                <div className="self-end sm:self-auto sm:ml-auto">
                  <ReportExportMenu
                    reportType={report.reportType}
                    reportTitle={report.title}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Receipt Vault
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Upload, organize, and review expenditure receipts by date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.6fr] lg:items-stretch">
            <div className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4 lg:h-full">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Upload receipt</p>
                  <p className="text-xs text-muted-foreground">
                    Attach proof for each expenditure.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="w-full sm:w-auto">
                    <CategoryManagerDialog categories={categoryOptions} />
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chart-2/20">
                    <Upload className="h-4 w-4 text-chart-2" />
                  </div>
                </div>
              </div>
              <ReceiptUploadForm
                categories={receiptCategories}
                paymentMethods={paymentMethods}
                currentBalance={currentBalance}
                lastReceived={lastReceived}
                lastSpent={lastSpent}
                lastReceiptDate={lastReceiptDate}
              />
            </div>

            <div className="space-y-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Receipt archive</p>
                  <p className="text-[11px] text-muted-foreground">
                    Latest receipts grouped by month and sorted by date.
                  </p>
                </div>
                <ReceiptsExportButton receipts={receipts} />
              </div>

              <div className="hidden items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:grid md:grid-cols-[110px_1.4fr_1fr_110px_160px_120px]">
                <span>Date</span>
                <span>Shoper</span>
                <span>Category</span>
                <span>Amount</span>
                <span>Receipt</span>
                <span>Actions</span>
              </div>

              <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
                {receipts.length === 0 ? (
                  <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                    No receipts uploaded yet.
                  </div>
                ) : (
                  receiptsByMonth.map(({ monthLabel, receipts: monthReceipts }) => (
                    <div key={monthLabel} className="space-y-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                        <span className="h-2 w-2 rounded-full bg-chart-1" />
                        <span>{monthLabel}</span>
                      </div>
                      <div className="space-y-3">
                        {monthReceipts.map((receipt) => {
                          const statusBadge = (
                            <Badge
                              variant="outline"
                              className={`border text-[10px] ${
                                receipt.status === "Verified"
                                  ? "border-chart-2/40 text-chart-2 bg-chart-2/10"
                                  : receipt.status === "Pending"
                                    ? "border-chart-3/40 text-chart-3 bg-chart-3/10"
                                    : "border-chart-4/40 text-chart-4 bg-chart-4/10"
                              }`}
                            >
                              {receipt.status}
                            </Badge>
                          )

                          const statusControl =
                            canUpdateStatus && receipt.status !== "Verified" ? (
                              <div className="w-[110px]">
                                <ReceiptStatusSelect
                                  receiptId={receipt.id}
                                  initialStatus={receipt.status}
                                />
                              </div>
                            ) : null

                          const actions = (
                            <ReceiptActions
                              receipt={{
                                id: receipt.id,
                                receiptDate: receipt.date,
                                vendor: receipt.vendor,
                                category: receipt.category,
                                paymentMethod: receipt.paymentMethod,
                                amount: receipt.amount,
                                amountReceived: receipt.amountReceived,
                                previousBalance: receipt.previousBalance,
                                reference: receipt.reference,
                              }}
                              viewUrl={receipt.viewUrl}
                              categories={receiptCategories}
                              paymentMethods={paymentMethods}
                            />
                          )

                          return (
                            <div
                              key={receipt.id}
                              className="rounded-xl border border-border bg-secondary/20 p-4"
                            >
                              <div className="rounded-lg border border-border/60 bg-secondary/10 p-2.5 md:hidden">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                      Shoper
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                      {receipt.vendor}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {receipt.paymentMethod}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                      Amount
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                      KES {Number.isFinite(receipt.amount) ? receipt.amount.toLocaleString() : "0"}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                      Date
                                    </p>
                                    <p className="text-foreground">
                                      {formatShortDate(receipt.date)}
                                    </p>
                                    {receipt.reference && (
                                      <p className="text-[10px] text-muted-foreground">
                                        {receipt.reference}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                      Category
                                    </p>
                                    <p className="text-foreground">{receipt.category}</p>
                                  </div>
                                </div>
                                <div className="mt-2.5 flex items-center justify-between gap-2">
                                  <div className="flex flex-col items-start gap-2">
                                    {statusBadge}
                                    {statusControl}
                                  </div>
                                  {actions}
                                </div>
                              </div>

                              <div className="hidden md:grid md:grid-cols-[110px_1.4fr_1fr_110px_160px_120px] md:items-center md:gap-3">
                                <div className="text-xs text-foreground">
                                  <p className="font-medium">{formatShortDate(receipt.date)}</p>
                                  {receipt.reference && (
                                    <p className="text-[10px] text-muted-foreground">
                                      {receipt.reference}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-foreground">
                                    {receipt.vendor}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {receipt.paymentMethod}
                                  </p>
                                </div>
                                <div className="text-xs text-foreground">{receipt.category}</div>
                                <div className="text-xs font-semibold text-foreground">
                                  KES {Number.isFinite(receipt.amount) ? receipt.amount.toLocaleString() : "0"}
                                </div>
                                <div className="flex flex-col items-start gap-2">
                                  {statusBadge}
                                  {statusControl}
                                </div>
                                <div className="md:justify-self-center">{actions}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ShoppingListHistoryTable lists={shoppingLists} entries={shoppingEntries} />
    </div>
  )
}
