import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, TrendingUp, Package, DollarSign } from "lucide-react"

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
      </div>
    </AppShell>
  )
}
