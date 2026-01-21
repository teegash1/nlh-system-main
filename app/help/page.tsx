import { AppShell } from "@/components/layout/app-shell"
import { HelpCenter } from "@/components/help/help-center"

export default function HelpPage() {
  return (
    <AppShell title="Help & Support" subtitle="Find answers and get assistance">
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Help & Support</h1>
          <p className="text-sm text-muted-foreground">
            How can we help you today?
          </p>
        </div>
        <HelpCenter />
      </div>
    </AppShell>
  )
}
