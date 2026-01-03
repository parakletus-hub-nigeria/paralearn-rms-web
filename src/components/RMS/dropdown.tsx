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
import { AddStudentDialog, AddTeacherDialog } from "./dialogs"

export const UserDropDown = ({children} : {children : ReactNode}) => {
    const dropDown = [
        {
            text: "Add Teachers",
            icon: Users2,
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
        {/*  <DropdownMenuItem className="flex flex-row items-center space-x-1">
            <Users2/>
            <p>Add Teachers</p>
        </DropdownMenuItem>
         <DropdownMenuItem className="flex flex-row items-center space-x-1">
            <GraduationCap/>
            <p>Add Students</p>
        </DropdownMenuItem>
         <DropdownMenuItem className="flex flex-row items-center space-x-1">
            <DownloadCloud/>
            <p>Download CSV</p>
        </DropdownMenuItem>
         <DropdownMenuItem className="flex flex-row items-center space-x-1">
            <Download/>
            <p>Import CSV</p>
        </DropdownMenuItem> */}

            {dropDown.map((items, index) => {
  if (items.text === "Add Students") {
    return (
      <AddStudentDialog key={index}>
        <DropdownMenuItem 
            className="flex flex-row items-center space-x-1" 
            onSelect={(e) => e.preventDefault()}
        >
          <items.icon />
          <p>{items.text}</p>
        </DropdownMenuItem>
      </AddStudentDialog>
    );
  } else if(items.text === "Add Teachers") {
    return ( 
      <AddTeacherDialog key={index}>
        <DropdownMenuItem 
            className="flex flex-row items-center space-x-1" 
            onSelect={(e) => e.preventDefault()}
        >
          <items.icon />
          <p>{items.text}</p>
        </DropdownMenuItem>
      </AddTeacherDialog>
    );
  }

  // CASE 2: All other buttons (Render normally)
  return (
    <DropdownMenuItem key={index} className="flex flex-row items-center space-x-1">
      <items.icon />
      <p>{items.text}</p>
    </DropdownMenuItem>
  );
})}

  </DropdownMenuContent>
</DropdownMenu>
    )
}