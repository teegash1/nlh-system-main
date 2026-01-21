"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  BarChart3,
  Users,
  HelpCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useNotifications } from "@/components/notifications/use-notifications"

const mobileMenuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Stock Taking", href: "/stock", icon: Package },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
]

const searchItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    description: "Overview and KPIs",
    keywords: ["home", "overview", "kpi", "summary"],
  },
  {
    name: "Stock Taking",
    href: "/stock",
    description: "Weekly counts and stock matrix",
    keywords: ["inventory", "items", "counts", "reorder"],
  },
  {
    name: "Reports",
    href: "/reports",
    description: "Receipts and exports",
    keywords: ["expenses", "receipts", "pdf", "csv"],
  },
  {
    name: "Analytics",
    href: "/analytics",
    description: "Trends and insights",
    keywords: ["charts", "usage", "valuation"],
  },
  {
    name: "Team",
    href: "/team",
    description: "Roles and access",
    keywords: ["members", "permissions"],
  },
  {
    name: "Settings",
    href: "/settings",
    description: "Preferences and profile",
    keywords: ["account", "profile", "notifications"],
  },
  {
    name: "Notifications",
    href: "/notifications",
    description: "Alerts and updates",
    keywords: ["alerts", "messages"],
  },
  {
    name: "Help & Support",
    href: "/help",
    description: "Guides and support",
    keywords: ["faq", "docs", "support"],
  },
]

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userName, setUserName] = useState<string>("User")
  const [userRole, setUserRole] = useState<string>("Viewer")
  const [userEmail, setUserEmail] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()
  const { notifications, unreadCount, isLoading: notificationsLoading } = useNotifications()

  useEffect(() => {
    const supabase = createClient()
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) return
      if (user.email) setUserEmail(user.email)
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle()
      if (profile?.full_name) {
        setUserName(profile.full_name)
      } else if (user.email) {
        setUserName(user.email.split("@")[0] ?? "User")
      }
      if (profile?.role) {
        setUserRole(profile.role)
      }
    }
    loadProfile()
  }, [])

  const initials = useMemo(() => {
    const parts = userName.split(" ").filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
    }
    return (userName[0] ?? "U").toUpperCase()
  }, [userName])

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    return searchItems
      .filter((item) => {
        const haystack = [item.name, item.description, ...(item.keywords ?? [])]
          .join(" ")
          .toLowerCase()
        return haystack.includes(query)
      })
      .slice(0, 6)
  }, [searchQuery])

  const handleSearchSelect = (href: string) => {
    setSearchQuery("")
    setSearchOpen(false)
    router.push(href)
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchResults.length > 0) {
      event.preventDefault()
      handleSearchSelect(searchResults[0].href)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Page Title */}
          <div className="hidden md:flex flex-col">
            {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#2a2a30] to-[#1a1a1e] border border-[#3a3a40]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
                  className="stroke-[#a1a1aa]"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">NLH-SYSTEM</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items, reports..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 bg-secondary/50 border-border focus:bg-secondary text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card shadow-xl">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">
                      No matches found. Try “reports” or “stock”.
                    </div>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((item) => (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => handleSearchSelect(item.href)}
                          className="flex w-full items-start gap-3 px-4 py-2 text-left text-sm hover:bg-accent/50"
                        >
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-chart-2 px-1 text-[10px] font-semibold text-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border">
                <DropdownMenuLabel className="text-foreground">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                {notificationsLoading ? (
                  <DropdownMenuItem className="text-muted-foreground hover:text-foreground focus:text-foreground">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">Loading updates...</p>
                      <p className="text-xs text-muted-foreground">Checking alerts and reminders.</p>
                    </div>
                  </DropdownMenuItem>
                ) : notifications.length === 0 ? (
                  <DropdownMenuItem className="text-muted-foreground hover:text-foreground focus:text-foreground">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">No notifications</p>
                      <p className="text-xs text-muted-foreground">You are all caught up.</p>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  notifications.slice(0, 4).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="text-muted-foreground hover:text-foreground focus:text-foreground"
                      onSelect={(event) => {
                        if (!notification.href) return
                        event.preventDefault()
                        router.push(notification.href)
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {notification.time}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="text-chart-1 focus:text-chart-1"
                  onSelect={(event) => {
                    event.preventDefault()
                    router.push("/notifications")
                  }}
                >
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full px-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#3a3a40] to-[#2a2a30] border border-[#4a4a50]">
                      <span className="text-xs font-semibold text-foreground">{initials}</span>
                    </div>
                    <div className="hidden max-w-[90px] flex-col text-left leading-tight sm:flex sm:max-w-[160px]">
                      <span className="text-[11px] font-semibold text-foreground sm:text-sm truncate">
                        {userName}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[10px]">
                        {userRole}
                      </span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel className="text-foreground">
                  <div className="flex flex-col">
                    <span>{userName}</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {userRole}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {userEmail || "Signed in"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="text-muted-foreground hover:text-foreground focus:text-foreground"
                  onSelect={(event) => {
                    event.preventDefault()
                    router.push("/settings")
                  }}
                >
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-muted-foreground hover:text-foreground focus:text-foreground">
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="text-destructive-foreground focus:text-destructive-foreground">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items, reports..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              {searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-card shadow-xl">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground">
                      No matches found. Try “reports” or “stock”.
                    </div>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((item) => (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => handleSearchSelect(item.href)}
                          className="flex w-full items-start gap-3 px-4 py-2 text-left text-sm hover:bg-accent/50"
                        >
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a2a30] to-[#1a1a1e] border border-[#3a3a40]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-6 h-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
                      className="stroke-[#a1a1aa]"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">Nobles Lighthouse</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Stock System</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-1">
              {mobileMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
