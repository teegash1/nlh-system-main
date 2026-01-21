"use client"

import { useMemo, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/components/notifications/use-notifications"
import {
  Bell,
  AlertTriangle,
  Package,
  FileText,
  CheckCircle,
  Clock,
  Trash2,
  CheckCheck,
} from "lucide-react"

const iconMap = {
  alert: AlertTriangle,
  update: Package,
  report: FileText,
  success: CheckCircle,
}

const colorMap = {
  alert: "bg-chart-3/20 text-chart-3",
  update: "bg-chart-1/20 text-chart-1",
  report: "bg-chart-5/20 text-chart-5",
  success: "bg-chart-2/20 text-chart-2",
}

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications()
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const filteredNotifications = useMemo(() => {
    const visible = notifications.filter((n) => !hiddenIds.has(n.id))
    return filter === "unread"
      ? visible.filter((n) => !n.read)
      : visible
  }, [notifications, hiddenIds, filter])

  const deleteNotification = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  return (
    <AppShell title="Notifications" subtitle="Stay updated with system alerts">
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread notifications
          </p>
        </div>

        {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-border",
                filter === "all"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-border",
                filter === "unread"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={() => setFilter("unread")}
            >
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-chart-1 text-white border-0 text-[10px] h-5 min-w-5">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
              onClick={markAllAsRead}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary mx-auto mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Loading notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Checking alerts, reminders, and reports.
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary mx-auto mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filter === "unread" ? "You're all caught up!" : "You have no notifications yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = iconMap[notification.type]
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex flex-col gap-3 p-4 rounded-xl border border-border transition-colors sm:flex-row sm:items-start sm:gap-4",
                        notification.read ? "bg-secondary/20" : "bg-secondary/40"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
                        colorMap[notification.type]
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className={cn(
                              "text-sm text-foreground",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-chart-1 shrink-0 mt-1.5" />
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.time}
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            {notification.href && (
                              <Link
                                href={notification.href}
                                className="text-chart-1 hover:underline"
                              >
                                Open
                              </Link>
                            )}
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-chart-1 hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="flex items-center gap-1 text-muted-foreground hover:text-chart-4"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
