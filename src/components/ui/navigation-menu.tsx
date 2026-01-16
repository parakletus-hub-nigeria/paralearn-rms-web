'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface NavigationMenuProps extends React.HTMLAttributes<HTMLNavElement> {
  children?: React.ReactNode
}

const NavigationMenu = React.forwardRef<HTMLNavElement, NavigationMenuProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        data-slot="navigation-menu"
        className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)}
        {...props}
      >
        {children}
      </nav>
    )
  }
)
NavigationMenu.displayName = 'NavigationMenu'

interface NavigationMenuListProps extends React.HTMLAttributes<HTMLUListElement> {}

const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        data-slot="navigation-menu-list"
        className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)}
        {...props}
      />
    )
  }
)
NavigationMenuList.displayName = 'NavigationMenuList'

interface NavigationMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        data-slot="navigation-menu-item"
        className={className}
        {...props}
      />
    )
  }
)
NavigationMenuItem.displayName = 'NavigationMenuItem'

interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        data-slot="navigation-menu-link"
        className={cn(
          'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  }
)
NavigationMenuLink.displayName = 'NavigationMenuLink'

export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink }
