"use client"

import { Home, Users, FileText, Upload, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSelector } from "react-redux"
import { RootState } from "@/reduxToolKit/store"

interface SidebarProps {
  activeItem?: string
}

export function Sidebar({ activeItem = "Report Cards" }: SidebarProps) {
  const { tenantInfo } = useSelector((s: RootState) => s.user);
  
  const items = [
    { icon: Home, label: "Dashboard" },
    { icon: Users, label: "Users" },
    { icon: FileText, label: "Report Cards" },
    { icon: Upload, label: "Bulk Upload" },
    { icon: User, label: "Profile" },
    { icon: Settings, label: "Settings" },
  ]

  return (
    <aside className="w-64 bg-background border-r border-border min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#641BC4]">
          {tenantInfo?.name || "ParaLearn"}
        </h1>
      </div>

      <nav className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.label === activeItem
          return (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
