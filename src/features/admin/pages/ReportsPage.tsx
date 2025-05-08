"use client"

import { ArrowUpDown, CheckCircle, Clock, Eye, Filter, MoreHorizontal, Search, Trash, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { useToast } from "../../../hooks/useToast"
import { adminApi } from "../api/adminApi"
import { AdminLayout } from "../components/layout/AdminLayout"
import type { TableState } from "../types"

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
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
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const { pagination, sorting, filters } = tableState

        const params: any = {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          since: filters.since || undefined,
          sort: sorting ? `${sorting.desc ? "desc" : "asc"}` : undefined,
        }

        const data = await adminApi.getReports(params)
        setReports(data)
      } catch (error) {
        console.error("Error fetching reports:", error)
        toast({
          title: "Error",
          description: "Failed to fetch reports. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [tableState, toast])

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

  const handleViewReport = async (id: string) => {
    try {
      setLoading(true)
      const report = await adminApi.getReport(id)
      setSelectedReport(report)
      setIsViewDialogOpen(true)
    } catch (error) {
      console.error("Error fetching report details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch report details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async () => {
    if (!reportToDelete) return

    try {
      setIsSubmitting(true)
      await adminApi.deleteReport(reportToDelete)

      // Reset state and refresh reports
      setReportToDelete(null)
      setIsDeleteDialogOpen(false)

      // Refresh reports list
      const { pagination, sorting, filters } = tableState
      const params: any = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        since: filters.since || undefined,
        sort: sorting ? `${sorting.desc ? "desc" : "asc"}` : undefined,
      }

      const data = await adminApi.getReports(params)
      setReports(data)

      toast({
        title: "Success",
        description: "Report deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting report:", error)
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResolveReport = async (id: string) => {
    try {
      setIsSubmitting(true)
      await adminApi.resolveReport(id)

      // Refresh reports list
      const { pagination, sorting, filters } = tableState
      const params: any = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        since: filters.since || undefined,
        sort: sorting ? `${sorting.desc ? "desc" : "asc"}` : undefined,
      }

      const data = await adminApi.getReports(params)
      setReports(data)

      toast({
        title: "Success",
        description: "Report marked as resolved",
      })
    } catch (error) {
      console.error("Error resolving report:", error)
      toast({
        title: "Error",
        description: "Failed to resolve report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDismissReport = async (id: string) => {
    try {
      setIsSubmitting(true)
      await adminApi.dismissReport(id)

      // Refresh reports list
      const { pagination, sorting, filters } = tableState
      const params: any = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        since: filters.since || undefined,
        sort: sorting ? `${sorting.desc ? "desc" : "asc"}` : undefined,
      }

      const data = await adminApi.getReports(params)
      setReports(data)

      toast({
        title: "Success",
        description: "Report dismissed",
      })
    } catch (error) {
      console.error("Error dismissing report:", error)
      toast({
        title: "Error",
        description: "Failed to dismiss report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkUnderReview = async (id: string) => {
    try {
      setIsSubmitting(true)
      await adminApi.markReportUnderReview(id)

      // Refresh reports list
      const { pagination, sorting, filters } = tableState
      const params: any = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        since: filters.since || undefined,
        sort: sorting ? `${sorting.desc ? "desc" : "asc"}` : undefined,
      }

      const data = await adminApi.getReports(params)
      setReports(data)

      toast({
        title: "Success",
        description: "Report marked as under review",
      })
    } catch (error) {
      console.error("Error marking report as under review:", error)
      toast({
        title: "Error",
        description: "Failed to mark report as under review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Open
          </Badge>
        )
      case "under_review":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Under Review
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Resolved
          </Badge>
        )
      case "dismissed":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Dismissed
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
                  <TableHead>Reported</TableHead>
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
                          <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-48 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : reports && reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports && reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.reason}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{report.description}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.reporterId}</TableCell>
                      <TableCell>{report.reportedId}</TableCell>
                      <TableCell>{formatDate(report.createdAt)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleMarkUnderReview(report.id)}>
                                <Clock className="mr-2 h-4 w-4" />
                                Mark Under Review
                              </DropdownMenuItem>
                            )}
                            {(report.status === "open" || report.status === "under_review") && (
                              <>
                                <DropdownMenuItem onClick={() => handleResolveReport(report.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Resolve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDismissReport(report.id)}>
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
              {Math.min((tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize, reports && reports.length || 0)} of{" "}
              {reports && reports.length || 0} reports
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
                  (tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize >= (reports && reports.length || 0) ||
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
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>View detailed information about this report.</DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Report Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Reason</span>
                        <span>{selectedReport.reason}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        <span>{getStatusBadge(selectedReport.status)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Created At</span>
                        <span>{formatDate(selectedReport.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Involved Parties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Reporter ID</span>
                        <span>{selectedReport.reporterId}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Reported ID</span>
                        <span>{selectedReport.reportedId}</span>
                      </div>
                      {selectedReport.listingId && (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-muted-foreground">Listing ID</span>
                          <span>{selectedReport.listingId}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line">{selectedReport.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Actions</CardTitle>
                    <CardDescription>Take action on this report</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {selectedReport.status === "open" && (
                        <Button
                          className="flex items-center gap-2"
                          onClick={() => {
                            handleMarkUnderReview(selectedReport.id)
                            setIsViewDialogOpen(false)
                          }}
                          disabled={isSubmitting}
                        >
                          <Clock className="h-4 w-4" />
                          Mark Under Review
                        </Button>
                      )}

                      {(selectedReport.status === "open" || selectedReport.status === "under_review") && (
                        <>
                          <Button
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              handleResolveReport(selectedReport.id)
                              setIsViewDialogOpen(false)
                            }}
                            disabled={isSubmitting}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Resolve Report
                          </Button>

                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => {
                              handleDismissReport(selectedReport.id)
                              setIsViewDialogOpen(false)
                            }}
                            disabled={isSubmitting}
                          >
                            <XCircle className="h-4 w-4" />
                            Dismiss Report
                          </Button>
                        </>
                      )}

                      <Button
                        variant="destructive"
                        className="flex items-center gap-2"
                        onClick={() => {
                          setReportToDelete(selectedReport.id)
                          setIsViewDialogOpen(false)
                          setIsDeleteDialogOpen(true)
                        }}
                        disabled={isSubmitting}
                      >
                        <Trash className="h-4 w-4" />
                        Delete Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Report Dialog */}
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
              onClick={handleDeleteReport}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}