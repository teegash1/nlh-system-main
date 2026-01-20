import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, TrendingUp, Package, DollarSign, Upload, Receipt, Eye } from "lucide-react"

const reports = [
  {
    id: "1",
    title: "Weekly Stock Report",
    description: "Comprehensive weekly inventory analysis",
    date: "January 20, 2026",
    type: "Weekly",
    icon: Calendar,
    color: "chart-1",
  },
  {
    id: "2",
    title: "Monthly Expense Report",
    description: "Monthly spending breakdown by category",
    date: "January 1, 2026",
    type: "Monthly",
    icon: DollarSign,
    color: "chart-2",
  },
  {
    id: "3",
    title: "Inventory Valuation",
    description: "Current stock value assessment",
    date: "January 15, 2026",
    type: "Quarterly",
    icon: Package,
    color: "chart-3",
  },
  {
    id: "4",
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
  fileName: string
  status: "Verified" | "Pending" | "Flagged"
  reference: string
}

const receiptEntries: ReceiptEntry[] = [
  {
    id: "rcp-1024",
    date: "2026-01-22",
    vendor: "Makena Stationers",
    category: "Office Supplies",
    amount: 3280,
    paymentMethod: "Mobile Money",
    fileName: "makena-stationers-jan-22.pdf",
    status: "Verified",
    reference: "EXP-1024",
  },
  {
    id: "rcp-1023",
    date: "2026-01-18",
    vendor: "Glory Foods",
    category: "Hospitality",
    amount: 18450,
    paymentMethod: "Bank Transfer",
    fileName: "glory-foods-jan-18.pdf",
    status: "Verified",
    reference: "EXP-1023",
  },
  {
    id: "rcp-1019",
    date: "2026-01-09",
    vendor: "Bright Energy",
    category: "Utilities",
    amount: 9650,
    paymentMethod: "Card",
    fileName: "bright-energy-jan-09.pdf",
    status: "Pending",
    reference: "EXP-1019",
  },
  {
    id: "rcp-1016",
    date: "2025-12-28",
    vendor: "Faithful Printing",
    category: "Print Materials",
    amount: 7420,
    paymentMethod: "Mobile Money",
    fileName: "faithful-printing-dec-28.jpg",
    status: "Verified",
    reference: "EXP-1016",
  },
  {
    id: "rcp-1012",
    date: "2025-12-17",
    vendor: "Unity Sound",
    category: "Equipment",
    amount: 22400,
    paymentMethod: "Bank Transfer",
    fileName: "unity-sound-dec-17.pdf",
    status: "Flagged",
    reference: "EXP-1012",
  },
  {
    id: "rcp-1008",
    date: "2025-11-30",
    vendor: "Mercy Cleaning",
    category: "Facilities",
    amount: 5120,
    paymentMethod: "Cash",
    fileName: "mercy-cleaning-nov-30.png",
    status: "Verified",
    reference: "EXP-1008",
  },
]

const receiptCategories = [
  "Hospitality",
  "Office Supplies",
  "Utilities",
  "Facilities",
  "Equipment",
  "Print Materials",
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

const sortedReceipts = [...receiptEntries].sort((a, b) => b.date.localeCompare(a.date))
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

export default function ReportsPage() {
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent premium-btn bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/20">
                    <Upload className="h-5 w-5 text-chart-2" />
                  </div>
                </div>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="receipt-date" className="text-foreground">
                      Expenditure Date
                    </Label>
                    <Input
                      id="receipt-date"
                      type="date"
                      required
                      className="bg-secondary/40 border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-vendor" className="text-foreground">
                      Vendor / Payee
                    </Label>
                    <Input
                      id="receipt-vendor"
                      placeholder="Vendor or ministry partner"
                      required
                      className="bg-secondary/40 border-border text-foreground"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="receipt-category" className="text-foreground">
                        Category
                      </Label>
                      <select
                        id="receipt-category"
                        className="h-9 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select category
                        </option>
                        {receiptCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receipt-method" className="text-foreground">
                        Payment Method
                      </Label>
                      <select
                        id="receipt-method"
                        className="h-9 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select method
                        </option>
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="receipt-amount" className="text-foreground">
                        Amount (KES)
                      </Label>
                      <Input
                        id="receipt-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                        className="bg-secondary/40 border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receipt-reference" className="text-foreground">
                        Reference ID
                      </Label>
                      <Input
                        id="receipt-reference"
                        placeholder="EXP-####"
                        className="bg-secondary/40 border-border text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-file" className="text-foreground">
                      Receipt File
                    </Label>
                    <Input
                      id="receipt-file"
                      type="file"
                      accept="image/png,image/jpeg,application/pdf"
                      required
                      className="bg-secondary/40 border-border text-foreground"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Upload PDF, JPG, or PNG. Max size 10MB.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-accent text-foreground hover:bg-accent/80 border border-border premium-btn"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Receipt
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Receipt archive</p>
                    <p className="text-[11px] text-muted-foreground">
                      Latest receipts grouped by month and sorted by date.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-border px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>

                <div className="hidden items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:grid md:grid-cols-[110px_1.3fr_1fr_110px_1fr_auto]">
                  <span>Date</span>
                  <span>Vendor</span>
                  <span>Category</span>
                  <span>Amount</span>
                  <span>Receipt</span>
                  <span>Actions</span>
                </div>

                {Array.from(receiptsByMonth.entries()).map(([monthLabel, receipts]) => (
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
                          <div className="flex flex-col gap-3 md:grid md:grid-cols-[110px_1.3fr_1fr_110px_1fr_auto] md:items-center">
                            <div className="text-xs text-foreground">
                              <p className="font-medium">{formatShortDate(receipt.date)}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {receipt.reference}
                              </p>
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
                              KES {receipt.amount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
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
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-border px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-border px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
