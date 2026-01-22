"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mail,
  MoreHorizontal,
  Shield,
  User,
  Eye,
  UserPlus,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import { inviteMember, removeMember, updateMemberRole } from "@/app/team/actions"

export type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "invited"
  lastActiveLabel: string
  initials: string
  avatarUrl?: string | null
}

const roleMeta = {
  admin: { label: "Administrator", icon: Shield, color: "bg-chart-1/20 text-chart-1" },
  manager: { label: "Stock Manager", icon: User, color: "bg-chart-2/20 text-chart-2" },
  viewer: { label: "Viewer", icon: Eye, color: "bg-chart-5/20 text-chart-5" },
}

const roleOptions = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Stock Manager" },
  { value: "viewer", label: "Viewer" },
]

const statusStyles = {
  active: "bg-chart-2",
  inactive: "bg-muted-foreground",
  invited: "bg-chart-4",
}

interface TeamClientProps {
  members: TeamMember[]
  isAdmin: boolean
  currentUserId?: string | null
  roleCounts: { admin: number; manager: number; viewer: number }
}

export function TeamClient({
  members,
  isAdmin,
  currentUserId,
  roleCounts,
}: TeamClientProps) {
  const router = useRouter()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "viewer",
  })
  const [isPending, startTransition] = useTransition()

  const totalMembers = members.length

  const roleCards = useMemo(
    () => [
      {
        label: "Administrator",
        description: "Full access to all features and settings",
        icon: Shield,
        count: roleCounts.admin,
        color: "bg-chart-1/20 text-chart-1",
      },
      {
        label: "Stock Manager",
        description: "Can add, edit, and delete stock items",
        icon: User,
        count: roleCounts.manager,
        color: "bg-chart-2/20 text-chart-2",
      },
      {
        label: "Viewer",
        description: "Read-only access to stock data and reports",
        icon: Eye,
        count: roleCounts.viewer,
        color: "bg-chart-5/20 text-chart-5",
      },
    ],
    [roleCounts]
  )

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault()
    setInviteError(null)

    if (!inviteForm.email.trim()) {
      setInviteError("Email address is required.")
      return
    }

    const payload = new FormData()
    payload.set("email", inviteForm.email)
    payload.set("fullName", inviteForm.fullName)
    payload.set("role", inviteForm.role)

    startTransition(async () => {
      const result = await inviteMember(payload)
      if (!result?.ok) {
        setInviteError(result?.message ?? "Unable to invite member.")
        return
      }
      setInviteForm({ fullName: "", email: "", role: "viewer" })
      setInviteOpen(false)
      router.refresh()
    })
  }

  const handleRoleUpdate = (memberId: string, role: string) => {
    const payload = new FormData()
    payload.set("userId", memberId)
    payload.set("role", role)

    startTransition(async () => {
      const result = await updateMemberRole(payload)
      if (!result?.ok) {
        return
      }
      router.refresh()
    })
  }

  const handleRemoveMember = async (memberId: string) => {
    const payload = new FormData()
    payload.set("userId", memberId)
    await removeMember(payload)
    router.refresh()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="md:hidden">
        <h1 className="text-xl font-semibold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground">
          Manage access and permissions
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            {totalMembers} member{totalMembers === 1 ? "" : "s"} in your organization
          </p>
        </div>
        {isAdmin ? (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/80 text-foreground border border-border premium-btn">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="text-foreground">Invite a team member</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Send an invitation email and assign a role.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite}>
                <div className="grid gap-4 py-4">
                  {inviteError && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
                      {inviteError}
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="invite-name" className="text-foreground">
                      Full name
                    </Label>
                    <Input
                      id="invite-name"
                      value={inviteForm.fullName}
                      onChange={(event) =>
                        setInviteForm({ ...inviteForm, fullName: event.target.value })
                      }
                      className="bg-secondary/50 border-border text-foreground"
                      placeholder="e.g., Jane Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invite-email" className="text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(event) =>
                        setInviteForm({ ...inviteForm, email: event.target.value })
                      }
                      className="bg-secondary/50 border-border text-foreground"
                      placeholder="name@church.org"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-foreground">Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(value) =>
                        setInviteForm({ ...inviteForm, role: value })
                      }
                    >
                      <SelectTrigger className="w-full bg-secondary/50 border-border text-foreground">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteOpen(false)}
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-accent hover:bg-accent/80 text-foreground border border-border"
                  >
                    {isPending ? "Sending..." : "Send Invite"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            disabled
          >
            Invite Member
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const meta = roleMeta[member.role as keyof typeof roleMeta] ?? roleMeta.viewer
          const RoleIcon = meta.icon
          const isSelf = currentUserId === member.id
          return (
            <Card
              key={member.id}
              className="bg-card border-border hover:border-accent transition-colors"
            >
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#3a3a40] to-[#2a2a30] border border-[#4a4a50] overflow-hidden">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-foreground">
                          {member.initials}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          className="text-muted-foreground hover:text-foreground focus:text-foreground"
                          onSelect={(event) => {
                            event.preventDefault()
                            window.location.href = `mailto:${member.email}`
                          }}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        {roleOptions.map((role) => (
                          <DropdownMenuItem
                            key={role.value}
                            className={cn(
                              "text-muted-foreground hover:text-foreground focus:text-foreground",
                              member.role === role.value && "text-foreground"
                            )}
                            onSelect={(event) => {
                              event.preventDefault()
                              handleRoleUpdate(member.id, role.value)
                            }}
                          >
                            Set {role.label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-border" />
                        <ConfirmDialog
                          trigger={
                            <DropdownMenuItem
                              className={cn(
                                "text-chart-4 hover:text-chart-4 focus:text-chart-4",
                                isSelf && "opacity-50"
                              )}
                              disabled={isSelf}
                            >
                              Remove
                            </DropdownMenuItem>
                          }
                          title="Remove team member?"
                          description="This will revoke access and remove their account."
                          confirmLabel="Remove"
                          onConfirm={() => handleRemoveMember(member.id)}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
                    <span>Role</span>
                    <Badge className={`${meta.color} border-0`}>
                      <RoleIcon className="mr-1 h-3 w-3" />
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2">
                    <span>Status</span>
                    <span className="flex items-center gap-2 text-foreground">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          statusStyles[member.status]
                        )}
                      />
                      {member.lastActiveLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="rounded-full border border-border bg-secondary/30 px-2 py-1">
                    {member.status === "invited" ? "Invitation pending" : "Access active"}
                  </span>
                  {member.status === "inactive" && (
                    <span className="rounded-full border border-border bg-secondary/30 px-2 py-1">
                      Last seen {member.lastActiveLabel}
                    </span>
                  )}
                  {member.status === "active" && (
                    <Link
                      href={`mailto:${member.email}`}
                      className="rounded-full border border-border bg-secondary/30 px-2 py-1 text-chart-1 hover:text-foreground"
                    >
                      Email member
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Roles & Permissions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Overview of available roles and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleCards.map((role) => (
              <div
                key={role.label}
                className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", role.color)}>
                    <role.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {role.count} member{role.count === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
