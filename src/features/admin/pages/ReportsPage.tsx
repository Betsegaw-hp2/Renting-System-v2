"use client"

import { ArrowUpDown, CheckCircle, Clock, Eye, Filter, MoreHorizontal, Search, Trash, XCircle } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
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
import { adminApi } from "../api/adminApi"
import { AdminLayout } from "../components/layout/AdminLayout"
import type { TableState } from "../types"

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tableState, setTableState] = useState<TableState>({
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    sorting: null,
    filters: {
      search: "",
      since: "",
      status: "",
    },
  })

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
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
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

  const handleStatusChange = (value: string) => {
    setTableState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        status: value,
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

  const handleViewReport = async (reportId: string) => {
    try {
      const report = await adminApi.getReport(reportId)
      setSelectedReport(report)
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching report details:", error)
    }
  }

  const handleReportAction = async (action: "dismiss" | "resolve" | "review", reportId: string) => {
    try {
      let result

      if (action === "dismiss") {
        result = await adminApi.dismissReport(reportId)
      } else if (action === "resolve") {
        result = await adminApi.resolveReport(reportId)
      } else if (action === "review") {
        result = await adminApi.markReportUnderReview(reportId)
      }

      // Update the report in the list
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: action === "dismiss" ? "dismissed" : action === "resolve" ? "resolved" : "under_review",
              }
            : report,
        ),
      )

      // Close dialog if open
      if (isDialogOpen) {
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange("")}>All statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("open")}>Open</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("under_review")}>Under Review</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("resolved")}>Resolved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("dismissed")}>Dismissed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
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
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("created_at")}
                    >
                      Reported
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]"></TableHead>
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
                          <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : reports && reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports && reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.reason}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{report.description}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleReportAction("review", report.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Mark Under Review
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReportAction("resolve", report.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReportAction("dismiss", report.id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Dismiss
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

        {selectedReport && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>Reported on {new Date(selectedReport.createdAt).toLocaleString()}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <span className="font-medium">Reason:</span>
                  <p className="mt-1">{selectedReport.reason}</p>
                </div>
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1">{selectedReport.description}</p>
                </div>
                {selectedReport.listingId && (
                  <div>
                    <span className="font-medium">Listing ID:</span>
                    <p className="mt-1 font-mono text-sm">{selectedReport.listingId}</p>
                  </div>
                )}
                {selectedReport.reportedId && (
                  <div>
                    <span className="font-medium">Reported User ID:</span>
                    <p className="mt-1 font-mono text-sm">{selectedReport.reportedId}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Reporter ID:</span>
                  <p className="mt-1 font-mono text-sm">{selectedReport.reporterId}</p>
                </div>
              </div>
              <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => handleReportAction("dismiss", selectedReport.id)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
                <Button variant="outline" onClick={() => handleReportAction("review", selectedReport.id)}>
                  <Clock className="mr-2 h-4 w-4" />
                  Mark Under Review
                </Button>
                <Button onClick={() => handleReportAction("resolve", selectedReport.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Resolve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}
