import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, MoreHorizontal, Shield, User, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const teamMembers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@nobles.org",
    role: "Administrator",
    status: "active",
    lastActive: "Now",
    initials: "AU",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@nobles.org",
    role: "Stock Manager",
    status: "active",
    lastActive: "2 hours ago",
    initials: "SJ",
  },
  {
    id: "3",
    name: "Michael Okonkwo",
    email: "michael.o@nobles.org",
    role: "Viewer",
    status: "active",
    lastActive: "Yesterday",
    initials: "MO",
  },
  {
    id: "4",
    name: "Grace Wanjiku",
    email: "grace.w@nobles.org",
    role: "Stock Manager",
    status: "inactive",
    lastActive: "3 days ago",
    initials: "GW",
  },
]

const roleIcons = {
  Administrator: Shield,
  "Stock Manager": User,
  Viewer: Eye,
}

const roleColors = {
  Administrator: "bg-chart-1/20 text-chart-1",
  "Stock Manager": "bg-chart-2/20 text-chart-2",
  Viewer: "bg-chart-5/20 text-chart-5",
}

export default function TeamPage() {
  return (
    <AppShell title="Team" subtitle="Manage team members and permissions">
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage access and permissions
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
            <p className="text-sm text-muted-foreground">{teamMembers.length} members in your organization</p>
          </div>
          <Button className="bg-accent hover:bg-accent/80 text-foreground border border-border premium-btn">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => {
            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || User
            const roleColor = roleColors[member.role as keyof typeof roleColors] || "bg-accent text-foreground"
            
            return (
              <Card key={member.id} className="bg-card border-border hover:border-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#3a3a40] to-[#2a2a30] border border-[#4a4a50]">
                        <span className="text-sm font-semibold text-foreground">{member.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem className="text-muted-foreground hover:text-foreground focus:text-foreground">
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-muted-foreground hover:text-foreground focus:text-foreground">
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-chart-4 hover:text-chart-4 focus:text-chart-4">
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge className={`${roleColor} border-0`}>
                      <RoleIcon className="mr-1 h-3 w-3" />
                      {member.role}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${member.status === "active" ? "bg-chart-2" : "bg-muted-foreground"}`} />
                      <span className="text-xs text-muted-foreground">{member.lastActive}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Roles & Permissions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Roles & Permissions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Overview of available roles and their access levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-1/20">
                    <Shield className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Administrator</p>
                    <p className="text-xs text-muted-foreground">Full access to all features and settings</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">1 member</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/20">
                    <User className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Stock Manager</p>
                    <p className="text-xs text-muted-foreground">Can add, edit, and delete stock items</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 members</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-5/20">
                    <Eye className="h-5 w-5 text-chart-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Viewer</p>
                    <p className="text-xs text-muted-foreground">Read-only access to stock data and reports</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">1 member</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
