'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReactNode } from "react"
import { Users2,GraduationCap,DownloadCloud,Download } from "lucide-react"

export const UserDropDown = ({children} : {children : ReactNode}) => {
    const dropDown = [
        {
            text: "Add Teachers",
            icon: Users2
        },
        {
            text: "Add Students",
            icon:  GraduationCap
        },
        {
            text: "Download CSV",
            icon: DownloadCloud
        },
        {
            text: "Import CSV",
            icon: Download
        }
    ]
    return (
<DropdownMenu>
  <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
  <DropdownMenuContent>
  
    {dropDown.map((item,index) => (
        <DropdownMenuItem className="flex flex-row items-center space-x-1">
            <item.icon/>
            <p>{item.text}</p>
        </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
    )
}