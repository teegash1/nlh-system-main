"use client"

import React, { useRef, useState, useTransition } from "react"
import { Upload } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { createReceipt } from "@/app/reports/actions"

interface ReceiptUploadFormProps {
  categories: string[]
  paymentMethods: string[]
  currentBalance?: number | null
  lastReceived?: number | null
  lastSpent?: number | null
  lastReceiptDate?: string | null
}

export function ReceiptUploadForm({
  categories,
  paymentMethods,
  currentBalance,
  lastReceived,
  lastSpent,
  lastReceiptDate,
}: ReceiptUploadFormProps) {
  const hasCategories = categories.length > 0
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    receiptDate: "",
    vendor: "",
    category: "",
    paymentMethod: "",
    amount: "",
    amountReceived: "",
    reference: "",
  })
  const fileRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!formData.receiptDate) {
      setError("Select an expenditure date.")
      return
    }

    if (!hasCategories) {
      setError("Add at least one category before uploading a receipt.")
      return
    }

    if (!formData.amountReceived) {
      setError("Enter the amount received for shopping.")
      return
    }

    const payload = new FormData()
    payload.set("receiptDate", formData.receiptDate)
    payload.set("vendor", formData.vendor)
    payload.set("category", formData.category)
    payload.set("paymentMethod", formData.paymentMethod)
    payload.set("amount", formData.amount)
    payload.set("amountReceived", formData.amountReceived)
    payload.set("reference", formData.reference)

    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError("Receipt file is required.")
      return
    }
    payload.set("file", file)

    startTransition(async () => {
      const result = await createReceipt(payload)
      if (!result?.ok) {
        setError(result?.message ?? "Unable to upload receipt.")
        return
      }
      setFormData({
        receiptDate: "",
        vendor: "",
        category: "",
        paymentMethod: "",
        amount: "",
        amountReceived: "",
        reference: "",
      })
      if (fileRef.current) {
        fileRef.current.value = ""
      }
      router.refresh()
    })
  }

  const amountValue = Number(formData.amount)
  const amountReceivedValue = Number(formData.amountReceived)
  const baseBalance = currentBalance ?? 0
  const balanceValue =
    Number.isFinite(amountValue) && Number.isFinite(amountReceivedValue)
      ? baseBalance + amountReceivedValue - amountValue
      : null
  const showSummary =
    currentBalance != null || lastReceived != null || lastSpent != null

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </div>
      )}
      {showSummary && (
        <div className="rounded-lg border border-border bg-secondary/20 p-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Received
              </p>
              <p className="text-sm font-semibold text-foreground">
                {lastReceived != null ? `KES ${lastReceived.toLocaleString()}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Spent
              </p>
              <p className="text-sm font-semibold text-foreground">
                {lastSpent != null ? `KES ${lastSpent.toLocaleString()}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Money at hand
              </p>
              <p className="text-sm font-semibold text-foreground">
                {currentBalance != null ? `KES ${currentBalance.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
          {lastReceiptDate && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Last updated: {lastReceiptDate}
            </p>
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="receipt-date" className="text-foreground">
          Expenditure Date
        </Label>
        <DatePicker
          id="receipt-date"
          value={formData.receiptDate}
          onChange={(value) =>
            setFormData({ ...formData, receiptDate: value })
          }
          placeholder="Select date"
          className="bg-secondary/40 border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt-vendor" className="text-foreground">
          Shoper
        </Label>
        <Input
          id="receipt-vendor"
          placeholder="Shoper name"
          required
          value={formData.vendor}
          onChange={(event) =>
            setFormData({ ...formData, vendor: event.target.value })
          }
          className="bg-secondary/40 border-border text-foreground"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="receipt-category" className="text-foreground">
            Category
          </Label>
          <select
            id="receipt-category"
            className="h-9 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground"
            required
            value={formData.category}
            onChange={(event) =>
              setFormData({ ...formData, category: event.target.value })
            }
            disabled={!hasCategories}
          >
            <option value="" disabled>
              {hasCategories ? "Select category" : "No categories yet"}
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {!hasCategories && (
            <p className="text-[11px] text-muted-foreground">
              Use Manage Categories to add one before uploading.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt-method" className="text-foreground">
            Payment Method
          </Label>
          <select
            id="receipt-method"
            className="h-9 w-full rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground"
            required
            value={formData.paymentMethod}
            onChange={(event) =>
              setFormData({ ...formData, paymentMethod: event.target.value })
            }
          >
            <option value="" disabled>
              Select method
            </option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="receipt-amount" className="text-foreground">
            Amount Spent (KES)
          </Label>
          <Input
            id="receipt-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            value={formData.amount}
            onChange={(event) =>
              setFormData({ ...formData, amount: event.target.value })
            }
            className="bg-secondary/40 border-border text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt-amount-received" className="text-foreground">
            Amount Received (KES)
          </Label>
          <Input
            id="receipt-amount-received"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            value={formData.amountReceived}
            onChange={(event) =>
              setFormData({ ...formData, amountReceived: event.target.value })
            }
            className="bg-secondary/40 border-border text-foreground"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="receipt-balance" className="text-foreground">
            Balance Remaining (KES)
          </Label>
          <Input
            id="receipt-balance"
            readOnly
            value={
              balanceValue == null ? "" : balanceValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
            }
            placeholder="Auto-calculated"
            className="bg-secondary/20 border-border text-foreground"
          />
          <p className="text-[11px] text-muted-foreground">
            Money at hand is auto-added to the amount received.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt-reference" className="text-foreground">
            Reference ID
          </Label>
          <Input
            id="receipt-reference"
            placeholder="EXP-####"
            value={formData.reference}
            onChange={(event) =>
              setFormData({ ...formData, reference: event.target.value })
            }
            className="bg-secondary/40 border-border text-foreground"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt-file" className="text-foreground">
          Receipt File
        </Label>
        <Input
          id="receipt-file"
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          required
          className="bg-secondary/40 border-border text-foreground"
        />
        <p className="text-[11px] text-muted-foreground">
          Upload PDF, JPG, or PNG. Max size 10MB.
        </p>
      </div>
      <Button
        type="submit"
        disabled={isPending || !hasCategories}
        className="w-full bg-accent text-foreground hover:bg-accent/80 border border-border premium-btn"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isPending ? "Uploading..." : "Upload Receipt"}
      </Button>
    </form>
  )
}
