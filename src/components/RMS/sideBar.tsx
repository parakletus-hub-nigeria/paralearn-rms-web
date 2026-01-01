'use client'
import { ReactNode, useState } from "react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from "../ui/sidebar"
import Image from "next/image"
import logo from "../../images/IMG-20201027-WA0000_2-removebg-preview 1.png"
import { Home, UserCircle, BookOpen, DownloadIcon, User, Settings } from "lucide-react"
import Link from "next/link"

const SideBar = ({ children }: { children: ReactNode }) => {
    const [selectedPath, setSelectedPath] = useState("/dashboard")

    const sideBarContent = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: Home
        },
        {
            label: "Users",
            path: "/users",
            icon: UserCircle
        },
        {
            label: "Report Cards",
            path: "/report_cards",
            icon: BookOpen
        },
        {
            label: "Bulk Upload",
            path: "/bulk_upload",
            icon: DownloadIcon
        },
        {
            label: "Profile",
            path: "/profile",
            icon: User
        },
        {
            label: "Settings",
            path: "/settings",
            icon: Settings
        },
    ]

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="w-full flex items-center gap-3 p-3">
                        <Image src={logo} className="w-[40px] sm:w-[40px]" alt="paralearn logo" />
                        <p className="text-black font-semibold">PARA LEARN</p>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <div className="flex flex-col gap-2 p-2">
                        {
                            sideBarContent.map((items, index) => {
                                const isSelected = selectedPath === items.path
                                return (
                                    <Link
                                        key={index}
                                        href={items.path}
                                        onClick={() => setSelectedPath(items.path)}
                                        className={`flex flex-row items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                                            isSelected
                                                ? "bg-[#EDEAFB] text-[#641BC4] font-semibold"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <items.icon className="w-5 h-5" />
                                        <span>{items.label}</span>
                                    </Link>
                                )
                            })
                        }
                    </div>
                </SidebarContent>
                <SidebarFooter />
            </Sidebar>
            <main className="my-[50px] mx-[20px] w-[100%]">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}

export default SideBar