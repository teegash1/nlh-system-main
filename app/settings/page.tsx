import { AppShell } from "@/components/layout/app-shell"
import { SettingsClient } from "@/components/settings/settings-client"
import { createClient } from "@/lib/supabase/server"

const normalizeRole = (role?: string | null) => {
  if (!role) return "viewer"
  const normalized = role.toLowerCase()
  if (normalized === "admin" || normalized === "administrator") return "admin"
  if (normalized === "manager" || normalized === "stock_manager") return "manager"
  if (normalized === "viewer") return "viewer"
  return "viewer"
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    return (
      <AppShell title="Settings" subtitle="Configure your system preferences">
        <div className="p-4 md:p-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in to manage your settings.
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url, church_name")
    .eq("id", user.id)
    .maybeSingle()

  const { data: prefs } = await supabase
    .from("user_settings")
    .select("low_stock_alerts, weekly_reports, system_updates, theme, last_backup_at")
    .eq("user_id", user.id)
    .maybeSingle()

  return (
    <AppShell title="Settings" subtitle="Configure your system preferences">
      <SettingsClient
        profile={{
          fullName:
            profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          email: user.email ?? "",
          role: normalizeRole(profile?.role ?? user.user_metadata?.role),
          churchName: profile?.church_name || "",
          avatarUrl: profile?.avatar_url ?? null,
        }}
        preferences={{
          lowStockAlerts: prefs?.low_stock_alerts ?? true,
          weeklyReports: prefs?.weekly_reports ?? true,
          systemUpdates: prefs?.system_updates ?? false,
          theme: prefs?.theme ?? "system",
          lastBackupAt: prefs?.last_backup_at ?? null,
        }}
      />
    </AppShell>
  )
}
