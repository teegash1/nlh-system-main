"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useTheme } from "next-themes"
import {
  Bell,
  Database,
  HelpCircle,
  Palette,
  Shield,
  UploadCloud,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  importData,
  markBackup,
  updateAppearance,
  updateAvatar,
  updateEmail,
  updatePassword,
  updatePreferences,
  updateProfile,
} from "@/app/settings/actions"

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

const sections = [
  { id: "profile", title: "Profile Settings", icon: UploadCloud },
  { id: "notifications", title: "Notifications", icon: Bell },
  { id: "security", title: "Security", icon: Shield },
  { id: "data", title: "Data Management", icon: Database },
  { id: "appearance", title: "Appearance", icon: Palette },
  { id: "help", title: "Help & Support", icon: HelpCircle },
]

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Stock Manager",
  viewer: "Viewer",
}

export function SettingsClient({
  profile,
  preferences,
}: {
  profile: SettingsProfile
  preferences: SettingsPreferences
}) {
  const { theme, setTheme } = useTheme()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatarUrl ?? null
  )
  const [profileForm, setProfileForm] = useState({
    fullName: profile.fullName,
    email: profile.email,
    churchName: profile.churchName,
  })
  const [prefForm, setPrefForm] = useState({
    lowStockAlerts: preferences.lowStockAlerts,
    weeklyReports: preferences.weeklyReports,
    systemUpdates: preferences.systemUpdates,
  })
  const [appearance, setAppearance] = useState(preferences.theme || "system")
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" })
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [prefMessage, setPrefMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [dataMessage, setDataMessage] = useState<string | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [backupTime, setBackupTime] = useState<string | null>(
    preferences.lastBackupAt
  )
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (appearance && appearance !== theme) {
      setTheme(appearance)
    }
  }, [appearance, setTheme, theme])

  const initials = useMemo(() => {
    const parts = profileForm.fullName.split(" ").filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
    }
    return (profileForm.fullName[0] ?? "U").toUpperCase()
  }, [profileForm.fullName])

  const handleProfileSave = () => {
    setProfileMessage(null)
    const payload = new FormData()
    payload.set("fullName", profileForm.fullName)
    payload.set("churchName", profileForm.churchName)

    startTransition(async () => {
      const result = await updateProfile(payload)
      if (!result?.ok) {
        setProfileMessage(result?.message ?? "Unable to update profile.")
        return
      }
      if (profileForm.email !== profile.email) {
        const emailPayload = new FormData()
        emailPayload.set("email", profileForm.email)
        const emailResult = await updateEmail(emailPayload)
        if (!emailResult?.ok) {
          setProfileMessage(emailResult?.message ?? "Email update failed.")
          return
        }
        setProfileMessage(emailResult?.message ?? "Profile updated.")
        return
      }
      setProfileMessage("Profile updated.")
    })
  }

  const handlePreferencesSave = () => {
    setPrefMessage(null)
    const payload = new FormData()
    payload.set("lowStockAlerts", String(prefForm.lowStockAlerts))
    payload.set("weeklyReports", String(prefForm.weeklyReports))
    payload.set("systemUpdates", String(prefForm.systemUpdates))

    startTransition(async () => {
      const result = await updatePreferences(payload)
      if (!result?.ok) {
        setPrefMessage(result?.message ?? "Unable to update preferences.")
        return
      }
      setPrefMessage("Preferences saved.")
    })
  }

  const handleAppearanceSave = (value: string) => {
    setAppearance(value)
    const payload = new FormData()
    payload.set("theme", value)

    startTransition(async () => {
      await updateAppearance(payload)
    })
  }

  const handlePasswordSave = () => {
    setPasswordMessage(null)
    if (passwordForm.password !== passwordForm.confirm) {
      setPasswordMessage("Passwords do not match.")
      return
    }
    const payload = new FormData()
    payload.set("password", passwordForm.password)

    startTransition(async () => {
      const result = await updatePassword(payload)
      if (!result?.ok) {
        setPasswordMessage(result?.message ?? "Unable to update password.")
        return
      }
      setPasswordForm({ password: "", confirm: "" })
      setPasswordMessage("Password updated.")
    })
  }

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setProfileMessage(null)
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)

    const payload = new FormData()
    payload.set("avatar", file)
    startTransition(async () => {
      const result = await updateAvatar(payload)
      if (!result?.ok) {
        setProfileMessage(result?.message ?? "Unable to upload photo.")
        setAvatarPreview(profile.avatarUrl ?? null)
        return
      }
      if (result.url) {
        setAvatarPreview(result.url)
      }
      setProfileMessage("Profile photo updated.")
    })
  }

  const handleExport = async () => {
    setDataMessage(null)
    try {
      const res = await fetch("/api/settings/export?format=xlsx", { cache: "no-store" })
      if (!res.ok) {
        setDataMessage("Unable to export data.")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `nlh-backup-${format(new Date(), "yyyy-MM-dd")}.xlsx`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      setDataMessage("Unable to export data.")
    }
  }

  const handleBackup = () => {
    setDataMessage(null)
    startTransition(async () => {
      await handleExport()
      const timestamp = new Date().toISOString()
      const payload = new FormData()
      payload.set("timestamp", timestamp)
      const result = await markBackup(payload)
      if (!result?.ok) {
        setDataMessage(result?.message ?? "Backup failed.")
        return
      }
      setBackupTime(timestamp)
      setDataMessage("Backup saved.")
    })
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportMessage(null)
    const payload = new FormData()
    payload.set("file", file)

    startTransition(async () => {
      const result = await importData(payload)
      if (!result?.ok) {
        setImportMessage(result?.message ?? "Import failed.")
        return
      }
      setImportMessage(result?.message ?? "Import completed.")
      if (importInputRef.current) {
        importInputRef.current.value = ""
      }
    })
  }

  const lastBackupLabel = backupTime
    ? `Last backup ${formatDistanceToNow(new Date(backupTime), { addSuffix: true })}`
    : "No backup yet"

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="md:hidden">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1 px-3 pb-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <section.icon className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm text-foreground">{section.title}</p>
                  </div>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border" id="profile">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Profile Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#3a3a40] to-[#2a2a30] border border-[#4a4a50] overflow-hidden">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-foreground">{initials}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                  >
                    Change Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    JPG, PNG, or WEBP up to 2MB.
                  </span>
                </div>
              </div>
              {profileMessage && (
                <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
                  {profileMessage}
                </div>
              )}
              <Separator className="bg-border" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.fullName}
                    onChange={(event) =>
                      setProfileForm({ ...profileForm, fullName: event.target.value })
                    }
                    className="bg-secondary/50 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm({ ...profileForm, email: event.target.value })
                    }
                    className="bg-secondary/50 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">Role</Label>
                  <Input
                    id="role"
                    value={roleLabels[profile.role] ?? profile.role}
                    disabled
                    className="bg-secondary/50 border-border text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="church" className="text-foreground">Church Name</Label>
                  <Input
                    id="church"
                    value={profileForm.churchName}
                    onChange={(event) =>
                      setProfileForm({ ...profileForm, churchName: event.target.value })
                    }
                    className="bg-secondary/50 border-border text-foreground"
                    placeholder="Nobles Lighthouse"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  className="bg-accent hover:bg-accent/80 text-foreground border border-border premium-btn"
                  onClick={handleProfileSave}
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" id="notifications">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Notification Preferences</CardTitle>
              <CardDescription className="text-muted-foreground">
                Control how you receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prefMessage && (
                <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
                  {prefMessage}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Low Stock Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when items are running low</p>
                </div>
                <Switch
                  checked={prefForm.lowStockAlerts}
                  onCheckedChange={(value) =>
                    setPrefForm({ ...prefForm, lowStockAlerts: value })
                  }
                />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Weekly Reports</p>
                  <p className="text-xs text-muted-foreground">Receive weekly stock summary emails</p>
                </div>
                <Switch
                  checked={prefForm.weeklyReports}
                  onCheckedChange={(value) =>
                    setPrefForm({ ...prefForm, weeklyReports: value })
                  }
                />
              </div>
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">System Updates</p>
                  <p className="text-xs text-muted-foreground">Notifications about system changes</p>
                </div>
                <Switch
                  checked={prefForm.systemUpdates}
                  onCheckedChange={(value) =>
                    setPrefForm({ ...prefForm, systemUpdates: value })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  onClick={handlePreferencesSave}
                  disabled={isPending}
                >
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" id="security">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Security</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your password and secure your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
                  {passwordMessage}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordForm.password}
                    onChange={(event) =>
                      setPasswordForm({ ...passwordForm, password: event.target.value })
                    }
                    className="bg-secondary/50 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(event) =>
                      setPasswordForm({ ...passwordForm, confirm: event.target.value })
                    }
                    className="bg-secondary/50 border-border text-foreground"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  onClick={handlePasswordSave}
                  disabled={isPending}
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" id="data">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Data Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Backup, export, and manage your inventory data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataMessage && (
                <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
                  {dataMessage}
                </div>
              )}
              <div className="flex flex-col gap-3 rounded-lg bg-secondary/30 border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Last Backup</p>
                  <p className="text-xs text-muted-foreground">{lastBackupLabel}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  onClick={handleBackup}
                  disabled={isPending}
                >
                  Backup Now
                </Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  onClick={handleExport}
                  disabled={isPending}
                >
                  Export All Data
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  onClick={() => importInputRef.current?.click()}
                  disabled={isPending}
                >
                  Import Data
                </Button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
              {importMessage && (
                <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
                  {importMessage}
                </div>
              )}
              <div className="text-[11px] text-muted-foreground">
                Import expects JSON with <span className="text-foreground">categories</span> and{" "}
                <span className="text-foreground">items</span> arrays.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" id="appearance">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Appearance</CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose how the system looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
                <Label className="text-foreground">Theme</Label>
                <Select value={appearance} onValueChange={handleAppearanceSave}>
                  <SelectTrigger className="w-full bg-secondary/50 border-border text-foreground">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                Your preference is saved and applied across sessions.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border" id="help">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Help & Support</CardTitle>
              <CardDescription className="text-muted-foreground">
                Quick access to guides and support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Need help?</p>
                  <p className="text-xs text-muted-foreground">
                    Visit the Help Center for guides and troubleshooting.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  onClick={() => window.location.assign("/help")}
                >
                  Open Help Center
                </Button>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Support: <span className="text-foreground">nategadgets@gmail.com</span> ·{" "}
                <span className="text-foreground">254707694388</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
