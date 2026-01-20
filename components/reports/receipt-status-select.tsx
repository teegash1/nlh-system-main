"use client"

import { useState, useTransition } from "react"
import { updateReceiptStatus } from "@/app/reports/actions"

interface ReceiptStatusSelectProps {
  receiptId: string
  initialStatus: string
  disabled?: boolean
}

const statusOptions = ["Pending", "Verified", "Flagged"]

export function ReceiptStatusSelect({
  receiptId,
  initialStatus,
  disabled,
}: ReceiptStatusSelectProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()
  const isDisabled = disabled || isPending

  const handleChange = (value: string) => {
    setStatus(value)
    const payload = new FormData()
    payload.set("id", receiptId)
    payload.set("status", value)

    startTransition(async () => {
      await updateReceiptStatus(payload)
    })
  }

  return (
    <select
      value={status}
      onChange={(event) => handleChange(event.target.value)}
      disabled={isDisabled}
      className="h-8 w-full rounded-md border border-border bg-secondary/30 px-2 text-[11px] text-foreground"
    >
      {statusOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
