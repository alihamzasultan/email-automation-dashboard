import type { ElementType } from 'react'

export interface SidebarTeam {
  name: string
  logo: string | ElementType
  plan: string
}

export interface SidebarData {
  user: {
    name: string
    email: string
    avatar: string
  }
  teams: SidebarTeam[]
  navGroups: {
    title: string
    items: any[] // You can improve this by defining a NavItem type
  }[]
}
