"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/useToast"
import { formatDate } from "@/lib/DateUtils"
import { ArrowUpDown, CheckCircle, Clock, Eye, Filter, MoreHorizontal, Search, Trash, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useAdminReports } from "../hooks/useAdminReports"
import type { Report, ReportStatus } from "../types/report.types"
import { ReportDialog } from "./ReportDetailDialog"
import { UserCell } from "./UserCell"

// Add these type definitions at the top of AdminReport.tsx
interface PaginationState {
  pageIndex: number
  pageSize: number
}

interface SortingState {
  id: string
  desc: boolean
}

interface FiltersState {
  search: string
  since: string
}

interface TableState {
  pagination: PaginationState
  sorting: SortingState | null
  filters: FiltersState
}

 export const getStatusBadge = (status: Report['status'], selected: Report | null) => {
    const statusMap = {
      open: { label: 'Open', color: 'bg-red-100 text-red-800' },
      under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
      resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
      dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-800' },
    };

    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={statusMap[status].color}>
            {statusMap[status].label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Status: {statusMap[status].label}</p>
          <p>Last updated: {formatDate(selected?.updated_at ?? (new Date()).toISOString())}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

// Then modify the component's state declaration to use these interfaces:
export const AdminReport = () => {
  const { 
    list: reports, 
    selected, 
    loading, 
    error,
    loadList,
    loadOne,
    toDelete,
    toResolve,
    toDismiss,
    toUnderReview,
  } = useAdminReports()
  
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
  
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const params = {
      limit: tableState.pagination.pageSize,
      offset: tableState.pagination.pageIndex * tableState.pagination.pageSize,
      since: tableState.filters.since || undefined,
      sort: tableState.sorting ? `${tableState.sorting.id}_${tableState.sorting.desc ? 'desc' : 'asc'}` : undefined,
    }
    loadList(params)
  }, [tableState, loadList])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleSinceChange = (value: string) => {
    setTableState(prev => ({
      ...prev,
      filters: { ...prev.filters, since: value },
      pagination: { ...prev.pagination, pageIndex: 0 },
    }))
  }

  const handleSort = (columnId: string) => {
    setTableState(prev => ({
      ...prev,
      sorting: prev.sorting?.id === columnId ? 
        { id: columnId, desc: !prev.sorting.desc } : 
        { id: columnId, desc: false },
    }))
  }

  const handlePageChange = (pageIndex: number) => {
    setTableState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, pageIndex },
    }))
  }

  const handleViewReport = async (id: string) => {
    try {
      await loadOne(id)
      setIsViewDialogOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load report details",
        variant: "destructive",
      })
    }
  }

  const handleStatusAction = async (
    action: (id: string) => Promise<any>,
    id: string,
    successMessage: string
  ) => {
  try {
    setIsSubmitting(true)
    await action(id)
    toast({ title: "Success", description: successMessage })
    setIsViewDialogOpen(false)
    
    // Refresh the list after successful action
    await loadList({
      limit: tableState.pagination.pageSize,
      offset: tableState.pagination.pageIndex * tableState.pagination.pageSize,
      since: tableState.filters.since || undefined,
      sort: tableState.sorting ? `${tableState.sorting.desc ? "desc" : "asc"}` : undefined,
    })
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.message || "Failed to perform action",
      variant: "destructive"
    })
  } finally {
    setIsSubmitting(false)
  }
}

const handleDelete: (id: string) => Promise<void> = async (id: string) => {
  try {
      setIsSubmitting(true)
      await toDelete(id)
      setReportToDelete(null)
      setIsDeleteDialogOpen(false)
      toast({ title: "Success", description: "Report deleted successfully" })
      setIsViewDialogOpen(false)
      // Refresh the list
      await loadList({
        limit: tableState.pagination.pageSize,
        offset: tableState.pagination.pageIndex * tableState.pagination.pageSize,
        since: tableState.filters.since || undefined,
        sort: tableState.sorting ? `${tableState.sorting.desc ? "desc" : "asc"}` : undefined,
      })
  } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete report",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reports..."
                  className="w-full pl-8"
                  value={tableState.filters.search}
                  onChange={(e) =>
                    setTableState(prev => ({
                      ...prev,
                      filters: { ...prev.filters, search: e.target.value },
                      pagination: { ...prev.pagination, pageIndex: 0 },
                    }))
                  }
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
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("reason")}
                    >
                      Reason
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
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
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported User</TableHead>
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
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {Array(7).fill(0).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : reports?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports?.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.reason}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{report.description}</TableCell>
                      <TableCell>{getStatusBadge(report.status, selected ?? null)}</TableCell>
                      {/* Reporter */}
                      <TableCell>
                        <UserCell userId={report.reporter_id} />
                      </TableCell>
                      
                      {/* Reported User */}
                      <TableCell>
                        <UserCell userId={report.reported_id} />
                      </TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewReport(report.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {report.status === "open" && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusAction(toUnderReview, report.id, "Report marked under review")}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Mark Under Review
                              </DropdownMenuItem>
                            )}
                            {(report.status === "open" || report.status === "under_review") && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusAction(toResolve, report.id, "Report resolved")}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Resolve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusAction(toDismiss, report.id, "Report dismissed")}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Dismiss
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setReportToDelete(report.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
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
              {Math.min(
                (tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize,
                reports?.length ?? 0
              )} of {reports?.length ?? 0} reports
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
                  (tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize >= reports?.length ||
                  loading
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Report Dialog */}
      <ReportDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        selected={selected}
        loading={loading}
        onStatusChange={async (status: ReportStatus) => {
          if (!selected) return;
          
          try {
            setIsSubmitting(true);
            const actionMap: Partial<Record<ReportStatus, (id: string) => Promise<Report>>> = {
              under_review: toUnderReview,
              resolved: toResolve,
              dismissed: toDismiss
            };

            const action = actionMap[status];
            if (action) {
              // First update the status
              await action(selected.id);
              // Then refresh the list
              await loadList({
                limit: tableState.pagination.pageSize,
                offset: tableState.pagination.pageIndex * tableState.pagination.pageSize,
                since: tableState.filters.since || undefined,
                sort: tableState.sorting ? `${tableState.sorting.id}_${tableState.sorting.desc ? 'desc' : 'asc'}` : undefined,
              });
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to update report status",
              variant: "destructive"
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
        onDelete={async () => {
          if (!selected) return;
          try {
            setIsSubmitting(true);
            setReportToDelete(selected.id);
            setIsDeleteDialogOpen(true);
            
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to delete report",
              variant: "destructive"
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reportToDelete && handleDelete(reportToDelete)}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}