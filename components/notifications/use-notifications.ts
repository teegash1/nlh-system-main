"use client"

import { useEffect, useMemo, useState } from "react"
import {
  addMonths,
  addWeeks,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from "date-fns"

import { createClient } from "@/lib/supabase/client"

export type NotificationItem = {
  id: string
  type: "alert" | "update" | "report" | "success"
  title: string
  message: string
  time: string
  href?: string
  read: boolean
  severity?: "low" | "out"
}

const recurrenceLabels: Record<string, string> = {
  none: "Reminder",
  weekly: "Weekly reminder",
  biweekly: "Bi-weekly reminder",
  monthly: "Monthly reminder",
  quarterly: "Quarterly reminder",
}

const normalizeTimestamp = (value: string) => {
  let normalized = value.trim()
  if (!normalized) return null
  normalized = normalized.replace(" ", "T")
  if (/([+-]\d{2})$/.test(normalized)) {
    normalized = normalized.replace(/([+-]\d{2})$/, "$1:00")
  }
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) {
    normalized = `${normalized}Z`
  }
  return normalized
}

const parseTimestampUtc = (value: string) => {
  const normalized = normalizeTimestamp(value)
  if (!normalized) return new Date(NaN)
  return new Date(normalized)
}

const parseCountValue = (value: unknown, rawValue?: string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const raw = String(rawValue ?? "").trim().toLowerCase()
  if (!raw) return null
  if (raw === "nil" || raw === "none") return 0
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return null
}

const getNextOccurrence = (startAt: Date, recurrence: string, now: Date) => {
  if (recurrence === "none") {
    return isAfter(startAt, now) ? startAt : null
  }

  if (recurrence === "weekly" || recurrence === "biweekly") {
    const interval = recurrence === "weekly" ? 1 : 2
    let occurrence = startAt
    if (isBefore(occurrence, now)) {
      const diff = differenceInCalendarWeeks(now, occurrence, { weekStartsOn: 1 })
      const steps = Math.ceil(diff / interval) * interval
      occurrence = addWeeks(occurrence, steps)
      if (isBefore(occurrence, now)) {
        occurrence = addWeeks(occurrence, interval)
      }
    }
    return occurrence
  }

  if (recurrence === "monthly" || recurrence === "quarterly") {
    const interval = recurrence === "monthly" ? 1 : 3
    let occurrence = startAt
    if (isBefore(occurrence, now)) {
      const diff = differenceInCalendarMonths(now, occurrence)
      const steps = Math.ceil(diff / interval) * interval
      occurrence = addMonths(occurrence, steps)
      if (isBefore(occurrence, now)) {
        occurrence = addMonths(occurrence, interval)
      }
    }
    return occurrence
  }

  return null
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const loadNotifications = async () => {
      setIsLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) {
        setNotifications([])
        setIsLoading(false)
        return
      }
      setUserId(user.id)

      const now = new Date()
      const { data: settings } = await supabase
        .from("user_settings")
        .select("low_stock_alerts, weekly_reports, system_updates")
        .eq("user_id", user.id)
        .maybeSingle()

      const allowLowStock = settings?.low_stock_alerts ?? true
      const allowWeekly = settings?.weekly_reports ?? true
      const items: NotificationItem[] = []

      const isMonday = now.getDay() === 1
      if (isMonday && allowWeekly) {
        items.push({
          id: "weekly-report",
          type: "report",
          title: "Weekly report ready",
          message: "Go to Reports to download this week's summary.",
          time: "Today",
          href: "/reports",
          read: false,
        })
      }

      const { data: latestCountDate } = await supabase
        .from("stock_counts")
        .select("count_date")
        .order("count_date", { ascending: false })
        .limit(1)

      const latestDate = latestCountDate?.[0]?.count_date ?? null
      if (latestDate && allowLowStock) {
        const { data: countRows } = await supabase
          .from("stock_counts")
          .select(
            "item_id, raw_value, qty_numeric, item:inventory_items(name, unit, reorder_level)"
          )
          .eq("count_date", latestDate)

        const formattedDate = format(parseISO(latestDate), "MMM d, yyyy")
        ;(countRows ?? []).forEach((row: any) => {
          const qty = parseCountValue(row.qty_numeric, row.raw_value)
          if (qty == null) return
          const threshold = row.item?.reorder_level ?? null
          const isOut = qty <= 0
          const isLow =
            !isOut && threshold != null && Number(qty) <= Number(threshold)
          if (!isOut && !isLow) return
          const unit = row.item?.unit ?? "pcs"
          const statusLabel = isOut ? "Out of stock" : "Low stock"
          const qtyLabel = isOut ? "0" : `${qty} ${unit}`
          items.push({
            id: `low-${row.item_id}`,
            type: "alert",
            title: statusLabel,
            message: `${row.item?.name ?? "Item"} • ${qtyLabel} remaining (as of ${formattedDate}).`,
            time: "Active",
            href: "/stock",
            read: false,
            severity: isOut ? "out" : "low",
          })
        })
      }

      const { data: reminders } = await supabase
        .from("reminders")
        .select("id, title, start_at, recurrence, color")
        .eq("user_id", user.id)
        .order("start_at", { ascending: true })

      const reminderNotifications = (reminders ?? [])
        .map((reminder: any) => {
          const startAt = parseTimestampUtc(String(reminder.start_at ?? ""))
          if (Number.isNaN(startAt.getTime())) return null
          const recurrence = String(reminder.recurrence ?? "none")
          const next = getNextOccurrence(startAt, recurrence, now)
          if (!next || !isSameDay(next, now)) return null
          return {
            id: `reminder-${reminder.id}`,
            type: "update" as const,
            title: reminder.title,
            message: `${recurrenceLabels[recurrence] ?? "Reminder"} • ${format(
              next,
              "EEE, MMM d 'at' h:mm a"
            )}.`,
            time: "Today",
            href: "/stock",
            read: false,
          }
        })
        .filter(Boolean) as NotificationItem[]

      items.push(...reminderNotifications.slice(0, 5))

      if (items.length > 0) {
        const { data: readRows, error: readError } = await supabase
          .from("notification_reads")
          .select("notification_key")
          .eq("user_id", user.id)
          .in(
            "notification_key",
            items.map((item) => item.id)
          )
        if (readError) {
          setNotifications(items)
          setIsLoading(false)
          return
        }
        const readKeys = new Set(
          (readRows ?? []).map((row: any) => String(row.notification_key))
        )
        setNotifications(
          items.map((item) => ({
            ...item,
            read: readKeys.has(item.id),
          }))
        )
      } else {
        setNotifications([])
      }
      setIsLoading(false)
    }

    loadNotifications()
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  const markAsRead = async (id: string) => {
    if (!userId) return
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
    const supabase = createClient()
    await supabase
      .from("notification_reads")
      .upsert({ user_id: userId, notification_key: id }, { onConflict: "user_id,notification_key" })
  }

  const markAllAsRead = async () => {
    if (!userId) return
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id)
    if (unreadIds.length === 0) return
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    const supabase = createClient()
    await supabase
      .from("notification_reads")
      .upsert(
        unreadIds.map((id) => ({
          user_id: userId,
          notification_key: id,
        })),
        { onConflict: "user_id,notification_key" }
      )
  }

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead }
}
