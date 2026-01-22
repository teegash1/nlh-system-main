"use client"

import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"

const SettingsClient = dynamic(
  () =>
    import("@/components/settings/settings-client").then((mod) => mod.SettingsClient),
  { ssr: false, loading: () => <SettingsSkeleton /> }
)

type SettingsProfile = {
  fullName: string
  email: string
  role: string
  churchName: string
  avatarUrl?: string | null
}

type SettingsPreferences = {
  lowStockAlerts: boolean
  weeklyReports: boolean
  systemUpdates: boolean
  theme: string
  lastBackupAt: string | null
}

const SettingsSkeleton = () => (
  <div className="p-4 md:p-6 space-y-6 animate-pulse">
    <Card className="border-border bg-card">
      <CardContent className="p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-secondary/60" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-10 rounded bg-secondary/60" />
          <div className="h-10 rounded bg-secondary/60" />
          <div className="h-10 rounded bg-secondary/60" />
          <div className="h-10 rounded bg-secondary/60" />
        </div>
        <div className="h-9 w-32 rounded bg-secondary/60" />
      </CardContent>
    </Card>
    <Card className="border-border bg-card">
      <CardContent className="p-6 space-y-4">
        <div className="h-5 w-48 rounded bg-secondary/60" />
        <div className="h-10 rounded bg-secondary/60" />
        <div className="h-10 rounded bg-secondary/60" />
        <div className="h-10 rounded bg-secondary/60" />
      </CardContent>
    </Card>
  </div>
)

export function SettingsClientWrapper({
  profile,
  preferences,
}: {
  profile: SettingsProfile
  preferences: SettingsPreferences
}) {
  return <SettingsClient profile={profile} preferences={preferences} />
}
