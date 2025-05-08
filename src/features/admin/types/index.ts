import type React from "react"
// Admin dashboard types
export interface AdminDashboardStats {
  totalUsers: number
  totalListings: number
  totalCategories: number
  totalReports: number
  activeListings: number
  pendingReports: number
  newUsersThisMonth: number
  newListingsThisMonth: number
}

export interface AdminTableColumn {
  id: string
  header: string
  accessorKey: string
  cell?: (info: any) => React.ReactNode
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export interface SortingState {
  id: string
  desc: boolean
}

export interface FilterState {
  search: string
  since?: string
  status?: string
}

export interface TableState {
  pagination: PaginationState
  sorting: SortingState | null
  filters: FilterState
}
