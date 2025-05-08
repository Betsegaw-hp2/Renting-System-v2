"use client"

import { ArrowUpDown, Edit, Eye, Filter, Home, MoreHorizontal, Search, Tag, Trash } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { Input } from "../../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { adminApi } from "../api/adminApi"
import { AdminLayout } from "../components/layout/AdminLayout"
import type { TableState } from "../types"

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tableState, setTableState] = useState<TableState>({
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    sorting: null,
    filters: {
      search: "",
      since: "",
    },
  })

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        const { pagination, sorting, filters } = tableState

        const params: any = {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          search: filters.search || undefined,
          since: filters.since || undefined,
          sort: sorting ? `${sorting.desc ? "desc" : "asc"}` : undefined,
        }

        const data = await adminApi.getListings(params)
        setListings(data)
      } catch (error) {
        console.error("Error fetching listings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [tableState])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        search: e.target.value,
      },
      pagination: {
        ...prev.pagination,
        pageIndex: 0,
      },
    }))
  }

  const handleSinceChange = (value: string) => {
    setTableState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        since: value,
      },
      pagination: {
        ...prev.pagination,
        pageIndex: 0,
      },
    }))
  }

  const handleSort = (columnId: string) => {
    setTableState((prev) => ({
      ...prev,
      sorting:
        prev.sorting?.id === columnId ? { id: columnId, desc: !prev.sorting.desc } : { id: columnId, desc: false },
    }))
  }

  const handlePageChange = (pageIndex: number) => {
    setTableState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        pageIndex,
      },
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Available
          </Badge>
        )
      case "booked":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Booked
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search listings..."
                  className="w-full pl-8"
                  value={tableState.filters.search}
                  onChange={handleSearch}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSinceChange("")}>All time</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSinceChange("7")}>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSinceChange("30")}>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSinceChange("90")}>Last 90 days</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("title")}
                    >
                      Title
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("price")}
                    >
                      Price
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("views_count")}
                    >
                      Views
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("created_at")}
                    >
                      Created
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded bg-muted"></div>
                            <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-12 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : listings && listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No listings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  listings && listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {listing.media && listing.media.length > 0 ? (
                            <img
                              src={listing.media[0].mediaUrl || "/placeholder.svg"}
                              alt={listing.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                              <Home className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{listing.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{listing.category?.name || "Unknown"}</TableCell>
                      <TableCell>${listing.price.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(listing.status)}</TableCell>
                      <TableCell>{listing.viewsCount}</TableCell>
                      <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="mr-2 h-4 w-4" />
                              Manage Tags
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {tableState.pagination.pageIndex * tableState.pagination.pageSize + 1} to{" "}
              {Math.min((tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize, listings && listings.length || 0)}{" "}
              of {listings && listings.length || 0} listings
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(tableState.pagination.pageIndex - 1)}
                disabled={tableState.pagination.pageIndex === 0 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(tableState.pagination.pageIndex + 1)}
                disabled={
                  (tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize >= (listings && listings.length || 0) ||
                  loading
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
