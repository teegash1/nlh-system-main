import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Database, Palette, HelpCircle } from "lucide-react"

const settingsSections = [
  {
    id: "profile",
    title: "Profile Settings",
    description: "Manage your account information",
    icon: User,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Configure alert preferences",
    icon: Bell,
  },
  {
    id: "security",
    title: "Security",
    description: "Password and authentication",
    icon: Shield,
  },
  {
    id: "data",
    title: "Data Management",
    description: "Backup and export settings",
    icon: Database,
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Theme and display options",
    icon: Palette,
  },
  {
    id: "help",
    title: "Help & Support",
    description: "Get assistance and documentation",
    icon: HelpCircle,
  },
]

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Configure your system preferences">
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <Card className="bg-card border-border lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1 px-3 pb-3">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <section.icon className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-sm text-foreground">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Profile Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#3a3a40] to-[#2a2a30] border border-[#4a4a50]">
                    <span className="text-xl font-semibold text-foreground">NL</span>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>
                <Separator className="bg-border" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Full Name</Label>
                    <Input
                      id="name"
                      defaultValue="Admin User"
                      className="bg-secondary/50 border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="admin@nobles.org"
                      className="bg-secondary/50 border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-foreground">Role</Label>
                    <Input
                      id="role"
                      defaultValue="Administrator"
                      disabled
                      className="bg-secondary/50 border-border text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="church" className="text-foreground">Church Name</Label>
                    <Input
                      id="church"
                      defaultValue="Nobles Lighthouse"
                      className="bg-secondary/50 border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-accent hover:bg-accent/80 text-foreground border border-border premium-btn">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Notification Preferences</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Control how you receive alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Low Stock Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when items are running low</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly Reports</p>
                    <p className="text-xs text-muted-foreground">Receive weekly stock summary emails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">System Updates</p>
                    <p className="text-xs text-muted-foreground">Notifications about system changes</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Data Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Data Management</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Backup, export, and manage your inventory data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Last Backup</p>
                    <p className="text-xs text-muted-foreground">January 19, 2026 at 11:30 PM</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  >
                    Backup Now
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  >
                    Export All Data
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  >
                    Import Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
