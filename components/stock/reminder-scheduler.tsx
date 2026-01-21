"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { createReminder } from "@/app/stock/actions"

const recurrenceOptions = [
  { value: "none", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
]

const colorOptions = [
  { value: "chart-1", label: "Indigo", className: "bg-chart-1" },
  { value: "chart-2", label: "Emerald", className: "bg-chart-2" },
  { value: "chart-3", label: "Amber", className: "bg-chart-3" },
  { value: "chart-4", label: "Rose", className: "bg-chart-4" },
  { value: "chart-5", label: "Sky", className: "bg-chart-5" },
]

export function ReminderScheduler() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [scheduled, setScheduled] = useState<{
    title: string
    notes: string
    date: string
    time: string
    recurrence: string
    color: string
  } | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    notes: "",
    date: "",
    time: "09:00",
    recurrence: "none",
    color: "chart-1",
  })

  useEffect(() => {
    if (!open) {
      setError(null)
      setScheduled(null)
    }
  }, [open])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError("Reminder title is required.")
      return
    }

    if (!formData.date) {
      setError("Pick a reminder date.")
      return
    }

    const payload = new FormData()
    payload.set("title", formData.title.trim())
    payload.set("notes", formData.notes.trim())
    payload.set("date", formData.date)
    payload.set("time", formData.time || "09:00")
    payload.set("recurrence", formData.recurrence)
    payload.set("color", formData.color)

    startTransition(async () => {
      const result = await createReminder(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to schedule reminder.")
        return
      }
      setScheduled({
        title: formData.title.trim(),
        notes: formData.notes.trim(),
        date: formData.date,
        time: formData.time || "09:00",
        recurrence: formData.recurrence,
        color: formData.color,
      })
      setFormData({
        title: "",
        notes: "",
        date: "",
        time: "09:00",
        recurrence: "none",
        color: "chart-1",
      })
      router.refresh()
    })
  }

  const scheduledAt =
    scheduled && scheduled.date
      ? new Date(`${scheduled.date}T${scheduled.time || "09:00"}`)
      : null
  const scheduledLabel =
    scheduledAt && !Number.isNaN(scheduledAt.getTime())
      ? format(scheduledAt, "MMM d, yyyy 'at' h:mm a")
      : "Scheduled"
  const recurrenceLabel =
    recurrenceOptions.find((option) => option.value === scheduled?.recurrence)
      ?.label ?? "One-time"
  const colorLabel =
    colorOptions.find((option) => option.value === scheduled?.color)?.label ??
    "Indigo"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent sideOffset={6}>Schedule</TooltipContent>
      </Tooltip>
      <DialogContent className="bg-card border-border sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Schedule Reminder</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add reminders that surface in the dashboard calendar and weekly view.
          </DialogDescription>
        </DialogHeader>
        {scheduled ? (
          <div className="py-4 space-y-4">
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <p className="font-medium text-emerald-100">Reminder scheduled</p>
              <p className="text-xs text-emerald-200">
                Scheduled for {scheduledLabel}.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Title</span>
                <span className="text-foreground font-medium">{scheduled.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Repeat</span>
                <span className="text-foreground">{recurrenceLabel}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Color</span>
                <span className="flex items-center gap-2 text-foreground">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      colorOptions.find((option) => option.value === scheduled.color)
                        ?.className ?? "bg-chart-1"
                    )}
                  />
                  {colorLabel}
                </span>
              </div>
              {scheduled.notes ? (
                <div className="text-xs text-muted-foreground">
                  <span className="block text-foreground font-medium">Notes</span>
                  <span>{scheduled.notes}</span>
                </div>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduled(null)}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Schedule another
              </Button>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="bg-accent hover:bg-accent/80 text-foreground border border-border"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="reminder-title" className="text-foreground">
                  Reminder title
                </Label>
                <Input
                  id="reminder-title"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData({ ...formData, title: event.target.value })
                  }
                  className="bg-secondary/50 border-border text-foreground"
                  placeholder="e.g., Weekly stock count"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reminder-notes" className="text-foreground">
                  Notes (optional)
                </Label>
                <Input
                  id="reminder-notes"
                  value={formData.notes}
                  onChange={(event) =>
                    setFormData({ ...formData, notes: event.target.value })
                  }
                  className="bg-secondary/50 border-border text-foreground"
                  placeholder="Extra context or checklist"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-foreground">Date</Label>
                  <DatePicker
                    value={formData.date}
                    onChange={(value) =>
                      setFormData({ ...formData, date: value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reminder-time" className="text-foreground">
                    Time
                  </Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={formData.time}
                    onChange={(event) =>
                      setFormData({ ...formData, time: event.target.value })
                    }
                    className="bg-secondary/50 border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-foreground">Repeat</Label>
                  <Select
                    value={formData.recurrence}
                    onValueChange={(value) =>
                      setFormData({ ...formData, recurrence: value })
                    }
                  >
                    <SelectTrigger className="w-full bg-secondary/50 border-border text-foreground">
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {recurrenceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-foreground">Color</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, color: option.value })
                        }
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground transition-colors",
                          formData.color === option.value
                            ? "border-foreground/40 bg-accent text-foreground"
                            : "border-border bg-secondary/40 hover:bg-accent/60"
                        )}
                      >
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            option.className
                          )}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-accent hover:bg-accent/80 text-foreground border border-border"
              >
                {isPending ? "Scheduling..." : "Save Reminder"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
