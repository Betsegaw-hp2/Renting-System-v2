"use client"

import type { FeaturedListing } from "@/api/publicApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi } from "@/features/admin/api/adminApi"
import { AdminLayout } from "@/features/admin/components/layout/AdminLayout"
import { useToast } from "@/hooks/useToast"
import { ArrowDown, ArrowUp, Eye, Filter, MoreHorizontal, Search, Trash2 } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface TableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: { id: string; desc: boolean } | null;
  filters: {
    search: string;
    since: string; 
    city?: string; 
    min_price?: string; 
    max_price?: string; 
  };
}

export default function ListingsPage() {
  const [listings, setListings] = useState<FeaturedListing[]>([])
  const [totalListingsCount, setTotalListingsCount] = useState(0)
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
      city: "", 
      min_price: "", 
      max_price: "", 
    },
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate();

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        city: e.target.value,
      },
      pagination: { 
        ...prev.pagination,
        pageIndex: 0,
      },
    }))
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        min_price: e.target.value,
      },
      pagination: { 
        ...prev.pagination,
        pageIndex: 0,
      },
    }))
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        max_price: e.target.value,
      },
      pagination: { 
        ...prev.pagination,
        pageIndex: 0,
      },
    }))
  }

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        const { pagination, sorting, filters } = tableState

        const params: any = {
          limit: pagination.pageSize,
          offset: pagination.pageIndex, // Changed from pagination.pageIndex * pagination.pageSize
          search: filters.search || undefined,
          since: filters.since || undefined, 
          city: filters.city || undefined, 
          min_price: filters.min_price ? parseFloat(filters.min_price) : undefined, 
          max_price: filters.max_price ? parseFloat(filters.max_price) : undefined, 
        }

        if (sorting) {
          // Use the 'sort' parameter as per the API documentation image
          // Format: direction (e.g., "created_at,desc")
          params.sort = `${sorting.desc ? "desc" : "asc"}`;
        }

        const data = await adminApi.getListings(params)
        const stats = await adminApi.getDashboardStats() 

        setListings(data)
        setTotalListingsCount(stats.totalListings || data.length); 
      } catch (error) {
        console.error("Error fetching listings:", error)
        toast({
          title: "Error",
          description: "Failed to fetch listings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [tableState, toast])

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

  const handleViewListing = (id: string) => {
    navigate(`/admin/listings/${id}`);
  }

  const handleDeleteListing = async () => {
    if (!listingToDelete) return

    try {
      setIsSubmitting(true)
      await adminApi.deleteListing(listingToDelete)
      setListingToDelete(null)
      setIsDeleteDialogOpen(false)

      const { pagination, sorting, filters } = tableState;
      const params: any = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex, // Changed from pagination.pageIndex * pagination.pageSize
        search: filters.search || undefined,
        since: filters.since || undefined,
        city: filters.city || undefined,
        min_price: filters.min_price ? parseFloat(filters.min_price) : undefined,
        max_price: filters.max_price ? parseFloat(filters.max_price) : undefined,
      };
      if (sorting) {
        // Use the 'sort' parameter as per the API documentation image
        params.sort = `${sorting.id},${sorting.desc ? "desc" : "asc"}`;
      }

      const data = await adminApi.getListings(params);
      setListings(data);
      const stats = await adminApi.getDashboardStats();
      setTotalListingsCount(stats.totalListings || data.length);

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[280px] p-4 space-y-3">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="space-y-1">
                    <Label htmlFor="cityFilter" className="text-sm font-medium">City</Label>
                    <Input
                      id="cityFilter"
                      placeholder="Enter city"
                      value={tableState.filters.city || ""}
                      onChange={handleCityChange}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="minPriceFilter" className="text-sm font-medium">Min Price</Label>
                    <Input
                      id="minPriceFilter"
                      type="number"
                      placeholder="e.g., 100"
                      value={tableState.filters.min_price || ""}
                      onChange={handleMinPriceChange}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="maxPriceFilter" className="text-sm font-medium">Max Price</Label>
                    <Input
                      id="maxPriceFilter"
                      type="number"
                      placeholder="e.g., 500"
                      value={tableState.filters.max_price || ""}
                      onChange={handleMaxPriceChange}
                      className="h-9"
                    />
                  </div>
                  <DropdownMenuSeparator />
                  <div>
                    <Label className="text-sm font-medium">Created Since</Label>
                    <DropdownMenuRadioGroup
                      value={tableState.filters.since}
                      onValueChange={handleSinceChange}
                      className="mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <DropdownMenuRadioItem value="">All Time</DropdownMenuRadioItem>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DropdownMenuRadioItem value="7d">Last 7 days</DropdownMenuRadioItem>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DropdownMenuRadioItem value="15d">Last 15 days</DropdownMenuRadioItem>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DropdownMenuRadioItem value="30d">Last 30 days</DropdownMenuRadioItem>
                      </div>
                    </DropdownMenuRadioGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead onClick={() => handleSort("title")} className="cursor-pointer">
                    Title 
                    {tableState.sorting?.id === "title" && (
                      tableState.sorting.desc ? <ArrowDown className="inline h-4 w-4 ml-1" /> : <ArrowUp className="inline h-4 w-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("price")} className="cursor-pointer">
                    Price 
                    {tableState.sorting?.id === "price" && (
                      tableState.sorting.desc ? <ArrowDown className="inline h-4 w-4 ml-1" /> : <ArrowUp className="inline h-4 w-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                    Status 
                    {tableState.sorting?.id === "status" && (
                      tableState.sorting.desc ? <ArrowDown className="inline h-4 w-4 ml-1" /> : <ArrowUp className="inline h-4 w-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort("created_at")} className="cursor-pointer">
                    Created At 
                    {tableState.sorting?.id === "created_at" && (
                      tableState.sorting.desc ? <ArrowDown className="inline h-4 w-4 ml-1" /> : <ArrowUp className="inline h-4 w-4 ml-1" />
                    )}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center"> 
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center"> 
                      No listings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <img
                          src={listing.media && listing.media.length > 0 ? listing.media[0].media_url : "/placeholder.svg"}
                          alt={listing.title}
                          className="h-12 w-12 rounded-md object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://picsum.photos/id/1/50/50" 
                          }}
                        />
                      </TableCell>
                      <TableCell>{listing.title}</TableCell>
                      <TableCell>${listing.price.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(listing.status)}</TableCell>
                      <TableCell>{formatDate(listing.created_at)}</TableCell> 
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"> 
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewListing(listing.id)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setListingToDelete(listing.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {tableState.pagination.pageIndex + 1} of{" "}
              {Math.ceil(totalListingsCount / tableState.pagination.pageSize) || 1} 
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(tableState.pagination.pageIndex - 1)}
                disabled={tableState.pagination.pageIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(tableState.pagination.pageIndex + 1)}
                disabled={(tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize >= totalListingsCount}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the listing.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteListing} disabled={isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
