'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

function ContextMenu({ children, ...props }: ContextMenuProps) {
  return <div data-slot="context-menu" {...props}>{children}</div>
}

interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ onContextMenu, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="context-menu-trigger"
        onContextMenu={onContextMenu}
        {...props}
      />
    )
  }
)
ContextMenuTrigger.displayName = 'ContextMenuTrigger'

interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="context-menu-content"
        className={cn(
          'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md',
          className,
        )}
        {...props}
      />
    )
  }
)
ContextMenuContent.displayName = 'ContextMenuContent'

interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="context-menu-item"
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
          className,
        )}
        {...props}
      />
    )
  }
)
ContextMenuItem.displayName = 'ContextMenuItem'

export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem }
