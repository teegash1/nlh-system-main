"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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

interface Notification {
  id: string
  type: "alert" | "update" | "report" | "success"
  title: string
  message: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Low Stock Alert",
    message: "Coffee sachets are running low - only 23 remaining. Consider restocking soon.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "report",
    title: "Weekly Report Ready",
    message: "Your stock report for Week 3 (Jan 15-21) is ready for download.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "update",
    title: "Stock Updated",
    message: "Sugar inventory has been updated to 3.5kg by Admin User.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "alert",
    title: "Critical: Out of Stock",
    message: "Drinking Chocolate is now out of stock. Immediate restocking required.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "success",
    title: "Backup Complete",
    message: "Your data backup was completed successfully.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "6",
    type: "report",
    title: "Monthly Summary",
    message: "December 2025 stock summary report is now available.",
    time: "2 days ago",
    read: true,
  },
]

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
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
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
          <div className="flex items-center gap-3">
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
            {filteredNotifications.length === 0 ? (
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
                        "flex items-start gap-4 p-4 rounded-xl border border-border transition-colors",
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
                          <div>
                            <p className={cn(
                              "text-sm text-foreground",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-chart-1 shrink-0 mt-1.5" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.time}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-[10px] text-chart-1 hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-[10px] text-muted-foreground hover:text-chart-4 flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
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
