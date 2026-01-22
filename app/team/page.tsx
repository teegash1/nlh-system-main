import { AppShell } from "@/components/layout/app-shell"
import { TeamClient, type TeamMember } from "@/components/team/team-client"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { differenceInCalendarDays, formatDistanceToNow } from "date-fns"

const buildInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
  }
  return (name[0] ?? "U").toUpperCase()
}

const normalizeRole = (role: string | null | undefined) => {
  if (!role) return "viewer"
  const normalized = role.toLowerCase()
  if (normalized === "admin" || normalized === "administrator") return "admin"
  if (normalized === "manager" || normalized === "stock_manager") return "manager"
  if (normalized === "viewer") return "viewer"
  return "viewer"
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    return (
      <AppShell title="Team" subtitle="Manage team members and permissions">
        <div className="p-4 md:p-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in to view your team.
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle()

  const isAdmin = profile?.role === "admin"
  const now = new Date()
  let members: TeamMember[] = []

  if (isAdmin) {
    const admin = createAdminClient()
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers()
    if (usersError) throw new Error(usersError.message)

    const users = usersData?.users ?? []
    const userIds = users.map((item) => item.id)
    const { data: profilesData, error: profilesError } = await admin
      .from("profiles")
      .select("id, full_name, role, avatar_url")
      .in("id", userIds)

    if (profilesError) throw new Error(profilesError.message)

    const profileMap = new Map(
      (profilesData ?? []).map((item) => [item.id, item])
    )

    members = users.map((authUser) => {
      const memberProfile = profileMap.get(authUser.id)
      const name =
        memberProfile?.full_name ||
        authUser.user_metadata?.full_name ||
        authUser.email?.split("@")[0] ||
        "User"
      const lastSignIn = authUser.last_sign_in_at
        ? new Date(authUser.last_sign_in_at)
        : null
      let status: TeamMember["status"] = "invited"
      let lastActiveLabel = "Invitation sent"
      if (lastSignIn) {
        const daysAgo = differenceInCalendarDays(now, lastSignIn)
        status = daysAgo <= 7 ? "active" : "inactive"
        lastActiveLabel = formatDistanceToNow(lastSignIn, { addSuffix: true })
      }

      return {
        id: authUser.id,
        name,
        email: authUser.email ?? "—",
        role: normalizeRole(memberProfile?.role ?? authUser.user_metadata?.role),
        status,
        lastActiveLabel,
        initials: buildInitials(name),
        avatarUrl: memberProfile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
      }
    })
  } else {
    const name =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User"
    members = [
      {
        id: user.id,
        name,
        email: user.email ?? "—",
        role: normalizeRole(profile?.role ?? user.user_metadata?.role),
        status: "active",
        lastActiveLabel: "You",
        initials: buildInitials(name),
        avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
      },
    ]
  }

  const roleCounts = members.reduce(
    (acc, member) => {
      const key = normalizeRole(member.role)
      acc[key as keyof typeof acc] += 1
      return acc
    },
    { admin: 0, manager: 0, viewer: 0 }
  )

  return (
    <AppShell title="Team" subtitle="Manage team members and permissions">
      <TeamClient
        members={members}
        isAdmin={isAdmin}
        currentUserId={user.id}
        roleCounts={roleCounts}
      />
    </AppShell>
  )
}
