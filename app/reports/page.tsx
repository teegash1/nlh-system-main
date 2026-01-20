import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReceiptUploadForm } from "@/components/reports/receipt-upload-form"
import { ReceiptActions } from "@/components/reports/receipt-actions"
import { ReceiptStatusSelect } from "@/components/reports/receipt-status-select"
import { ReceiptsExportButton } from "@/components/reports/receipts-export-button"
import { CategoryManagerDialog } from "@/components/stock/category-manager-dialog"
import { ReportExportMenu } from "@/components/reports/report-export-menu"
import { createClient } from "@/lib/supabase/server"
import { FileText, Download, Calendar, TrendingUp, Package, DollarSign, Upload } from "lucide-react"

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

type ReceiptEntry = {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  paymentMethod: string
  status: string
  reference: string | null
  viewUrl: string | null
  fileName: string | null
}

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

const monthNamesLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const formatShortDate = (value: string) => {
  const [year, month, day] = value.split("-")
  const monthLabel = monthNamesShort[Number(month) - 1] ?? ""
  return `${monthLabel} ${Number(day)}, ${year}`
}

const formatMonthLabel = (value: string) => {
  const [year, month] = value.split("-")
  const monthLabel = monthNamesLong[Number(month) - 1] ?? ""
  return `${monthLabel} ${year}`
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id ?? null
  let canUpdateStatus = false
  let receipts: ReceiptEntry[] = []
  let receiptCategories: string[] = []
  let categoryOptions: { id: string; name: string }[] = []

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("inventory_categories")
    .select("id, name")
    .order("name")

  if (categoriesError) {
    throw new Error(categoriesError.message)
  }

  receiptCategories = (categoriesData ?? []).map((category) => category.name)
  categoryOptions = (categoriesData ?? []).map((category) => ({
    id: category.id,
    name: category.name,
  }))

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()

    canUpdateStatus = profile?.role === "admin"

    const { data, error } = await supabase
      .from("receipts")
      .select(
        "id, receipt_date, vendor, category, amount, payment_method, status, reference, file_path"
      )
      .eq("user_id", userId)
      .order("receipt_date", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    const signedUrls = await Promise.all(
      (data ?? []).map(async (row) => {
        if (!row.file_path) {
          return { id: row.id, viewUrl: null, fileName: null }
        }
        const { data: signed } = await supabase.storage
          .from("receipts")
          .createSignedUrl(row.file_path, 60 * 60)
        const fileName = row.file_path.split("/").pop() ?? null
        return { id: row.id, viewUrl: signed?.signedUrl ?? null, fileName }
      })
    )

    const urlMap = new Map(
      signedUrls.map((entry) => [entry.id, entry])
    )

    receipts = (data ?? []).map((row) => {
      const urlEntry = urlMap.get(row.id)
      return {
        id: row.id,
        date: row.receipt_date,
        vendor: row.vendor,
        category: row.category,
        amount: Number(row.amount),
        paymentMethod: row.payment_method,
        status: row.status ?? "Pending",
        reference: row.reference,
        viewUrl: urlEntry?.viewUrl ?? null,
        fileName: urlEntry?.fileName ?? null,
      }
    })
  }

  const sortedReceipts = [...receipts].sort((a, b) =>
    b.date.localeCompare(a.date)
  )
  const receiptsByMonth = sortedReceipts.reduce((groups, receipt) => {
    const monthLabel = formatMonthLabel(receipt.date)
    const existing = groups.get(monthLabel)
    if (existing) {
      existing.push(receipt)
    } else {
      groups.set(monthLabel, [receipt])
    }
    return groups
  }, new Map<string, ReceiptEntry[]>())

  return (
    <AppShell title="Reports" subtitle="View and generate stock reports">
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            View and download inventory reports
          </p>
        </div>

        {/* Quick Actions */}
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
        </div>

        {/* Recent Reports */}
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
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border hover:border-accent transition-colors"
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
                  <ReportExportMenu
                    reportType={report.reportType}
                    reportTitle={report.title}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Receipts & Expenditures */}
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.6fr]">
              <div className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Upload receipt</p>
                    <p className="text-xs text-muted-foreground">
                      Attach proof for each expenditure.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CategoryManagerDialog categories={categoryOptions} />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/20">
                      <Upload className="h-5 w-5 text-chart-2" />
                    </div>
                  </div>
                </div>
                <ReceiptUploadForm
                  categories={receiptCategories}
                  paymentMethods={paymentMethods}
                />
              </div>

              <div className="space-y-4">
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

                {receipts.length === 0 ? (
                  <div className="rounded-xl border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                    No receipts uploaded yet.
                  </div>
                ) : (
                  Array.from(receiptsByMonth.entries()).map(([monthLabel, receipts]) => (
                    <div key={monthLabel} className="space-y-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                        <span className="h-2 w-2 rounded-full bg-chart-1" />
                        <span>{monthLabel}</span>
                      </div>
                      <div className="space-y-3">
                        {receipts.map((receipt) => (
                          <div
                            key={receipt.id}
                            className="rounded-xl border border-border bg-secondary/20 p-4"
                          >
                            <div className="flex flex-col gap-3 md:grid md:grid-cols-[110px_1.4fr_1fr_110px_160px_120px] md:items-center">
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
                              {canUpdateStatus && (
                                <div className="w-[110px]">
                                  <ReceiptStatusSelect
                                    receiptId={receipt.id}
                                    initialStatus={receipt.status}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="md:justify-self-center">
                              <ReceiptActions
                                receipt={{
                                  id: receipt.id,
                                  receiptDate: receipt.date,
                                  vendor: receipt.vendor,
                                  category: receipt.category,
                                  paymentMethod: receipt.paymentMethod,
                                  amount: receipt.amount,
                                  reference: receipt.reference,
                                }}
                                viewUrl={receipt.viewUrl}
                                categories={receiptCategories}
                                paymentMethods={paymentMethods}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
