'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="menubar"
        className={cn('flex h-9 items-center space-x-1 rounded-md border bg-background p-1', className)}
        {...props}
      />
    )
  }
)
Menubar.displayName = 'Menubar'

interface MenubarMenuProps {
  children?: React.ReactNode
}

function MenubarMenu({ children }: MenubarMenuProps) {
  return <div data-slot="menubar-menu">{children}</div>
}

interface MenubarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        data-slot="menubar-trigger"
        className={cn(
          'flex cursor-pointer select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
        {...props}
      />
    )
  }
)
MenubarTrigger.displayName = 'MenubarTrigger'

interface MenubarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="menubar-content"
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          className,
        )}
        {...props}
      />
    )
  }
)
MenubarContent.displayName = 'MenubarContent'

interface MenubarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const MenubarItem = React.forwardRef<HTMLButtonElement, MenubarItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        data-slot="menubar-item"
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className,
        )}
        {...props}
      />
    )
  }
)
MenubarItem.displayName = 'MenubarItem'

export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem }
