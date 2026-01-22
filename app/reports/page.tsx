import { AppShell } from "@/components/layout/app-shell"
import { ReportsClientSections } from "@/components/reports/reports-client-sections"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type ReceiptEntry = {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  amountReceived: number | null
  balance: number | null
  previousBalance: number | null
  paymentMethod: string
  status: string
  reference: string | null
  viewUrl: string | null
  fileName: string | null
  createdAt: string
}

const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const monthNamesLong = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const formatShortDate = (value: string) => {
  const [year, month, day] = value.split("-")
  const monthLabel = monthNamesShort[Number(month) - 1] ?? ""
  return `${monthLabel} ${Number(day)}, ${year}`
}

const formatMonthLabel = (value: string) => {
  const [year, month] = value.split("-")
  const monthLabel = monthNamesLong[Number(month) - 1] ?? ""
  return `${monthLabel} ${year}`
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id ?? null
  let canUpdateStatus = false
  let receipts: ReceiptEntry[] = []
  let receiptCategories: string[] = []
  let categoryOptions: { id: string; name: string }[] = []
  let shoppingLists: Array<{
    id: string
    title: string
    status: string
    created_at: string
    completed_at: string | null
  }> = []
  let shoppingEntries: Array<{
    list_id: string
    item_name: string
    category: string
    unit: string
    current_qty: number
    desired_qty: number
    unit_price: number | null
    status: string
  }> = []
  let adminClient: ReturnType<typeof createAdminClient> | null = null

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("inventory_categories")
    .select("id, name")
    .order("name")

  if (categoriesError) {
    throw new Error(categoriesError.message)
  }

  receiptCategories = (categoriesData ?? []).map((category) => category.name)
  categoryOptions = (categoriesData ?? []).map((category) => ({
    id: category.id,
    name: category.name,
  }))

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()

    canUpdateStatus = profile?.role === "admin"

    if (canUpdateStatus) {
      try {
        adminClient = createAdminClient()
      } catch {
        adminClient = null
      }
    }

    const receiptsClient = adminClient ?? supabase
    const receiptsQuery = receiptsClient
      .from("receipts")
      .select(
        "id, receipt_date, vendor, category, amount, amount_received, balance, payment_method, status, reference, file_path, created_at"
      )
      .order("receipt_date", { ascending: false })

    const { data, error } = await receiptsQuery

    if (error) {
      throw new Error(error.message)
    }

    const signedUrls = await Promise.all(
      (data ?? []).map(async (row) => {
        if (!row.file_path) {
          return { id: row.id, viewUrl: null, fileName: null }
        }
        const { data: signed } = await receiptsClient.storage
          .from("receipts")
          .createSignedUrl(row.file_path, 60 * 60)
        const fileName = row.file_path.split("/").pop() ?? null
        return { id: row.id, viewUrl: signed?.signedUrl ?? null, fileName }
      })
    )

    const urlMap = new Map(
      signedUrls.map((entry) => [entry.id, entry])
    )

    receipts = (data ?? []).map((row) => {
      const urlEntry = urlMap.get(row.id)
      return {
        id: row.id,
        date: row.receipt_date,
        vendor: row.vendor,
        category: row.category,
        amount: Number(row.amount),
        amountReceived: row.amount_received != null ? Number(row.amount_received) : null,
        balance: row.balance != null ? Number(row.balance) : null,
        previousBalance: null,
        paymentMethod: row.payment_method,
        status: row.status ?? "Pending",
        reference: row.reference,
        viewUrl: urlEntry?.viewUrl ?? null,
        fileName: urlEntry?.fileName ?? null,
        createdAt: row.created_at,
      }
    })

    const { data: listData, error: listError } = await supabase
      .from("shopping_lists")
      .select("id, title, status, created_at, completed_at")
      .order("created_at", { ascending: false })

    if (listError) {
      throw new Error(listError.message)
    }

    shoppingLists = listData ?? []

    if (shoppingLists.length > 0) {
      const { data: entryData, error: entryError } = await supabase
        .from("shopping_list_entries")
        .select(
          "list_id, item_name, category, unit, current_qty, desired_qty, unit_price, status"
        )
        .in(
          "list_id",
          shoppingLists.map((list) => list.id)
        )

      if (entryError) {
        throw new Error(entryError.message)
      }

      shoppingEntries =
        (entryData ?? []).map((row) => ({
          list_id: row.list_id,
          item_name: row.item_name,
          category: row.category,
          unit: row.unit,
          current_qty: Number(row.current_qty ?? 0),
          desired_qty: Number(row.desired_qty ?? 0),
          unit_price: row.unit_price != null ? Number(row.unit_price) : null,
          status: row.status ?? "Low stock",
        })) ?? []
    }
  }

  const receiptsChronological = [...receipts].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    const createdCompare = a.createdAt.localeCompare(b.createdAt)
    if (createdCompare !== 0) return createdCompare
    return a.id.localeCompare(b.id)
  })

  let runningBalance = 0
  const runningMap = new Map<string, { balance: number; previousBalance: number }>()
  receiptsChronological.forEach((receipt) => {
    const received = receipt.amountReceived ?? receipt.amount ?? 0
    const previousBalance = runningBalance
    runningBalance = previousBalance + received - receipt.amount
    runningMap.set(receipt.id, { balance: runningBalance, previousBalance })
  })

  receipts = receipts.map((receipt) => {
    const computed = runningMap.get(receipt.id)
    return {
      ...receipt,
      balance: computed?.balance ?? receipt.balance,
      previousBalance: computed?.previousBalance ?? null,
    }
  })

  const sortedReceipts = [...receipts].sort((a, b) =>
    b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  )
  const latestReceipt = sortedReceipts[0] ?? null
  const lastReceiptDate = latestReceipt ? formatShortDate(latestReceipt.date) : null
  const lastReceived = latestReceipt?.amountReceived ?? null
  const lastSpent = latestReceipt?.amount ?? null
  const currentBalance =
    latestReceipt?.balance ??
    (lastReceived != null && lastSpent != null
      ? (latestReceipt?.previousBalance ?? 0) + lastReceived - lastSpent
      : null)
  const receiptsByMonth = sortedReceipts.reduce((groups, receipt) => {
    const monthLabel = formatMonthLabel(receipt.date)
    const existing = groups.get(monthLabel)
    if (existing) {
      existing.push(receipt)
    } else {
      groups.set(monthLabel, [receipt])
    }
    return groups
  }, new Map<string, ReceiptEntry[]>())
  const receiptsByMonthEntries = Array.from(receiptsByMonth.entries()).map(
    ([monthLabel, monthReceipts]) => ({
      monthLabel,
      receipts: monthReceipts,
    })
  )

  return (
    <AppShell title="Reports" subtitle="View and generate stock reports">
      <ReportsClientSections
        canUpdateStatus={canUpdateStatus}
        receipts={receipts}
        receiptsByMonth={receiptsByMonthEntries}
        receiptCategories={receiptCategories}
        categoryOptions={categoryOptions}
        currentBalance={currentBalance}
        lastReceived={lastReceived}
        lastSpent={lastSpent}
        lastReceiptDate={lastReceiptDate}
        shoppingLists={shoppingLists}
        shoppingEntries={shoppingEntries}
      />
    </AppShell>
  )
}
