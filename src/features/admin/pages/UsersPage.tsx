"use client"

import { ArrowUpDown, Filter, MoreHorizontal, Search, UserPlus } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Added for navigation
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { UserRole, type User } from "../../../types/user.types";
import { adminApi } from "../api/adminApi";
import { AdminLayout } from "../components/layout/AdminLayout";
import type { TableState } from "../types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { pagination, sorting, filters } = tableState

      const params: any = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        search: filters.search || undefined,
        since: filters.since || undefined,
        sort: sorting ? `${sorting.id}:${sorting.desc ? "desc" : "asc"}` : undefined,
      }

      const users = await adminApi.getUsers(params)
      const UsersStat = await adminApi.getDashboardStats()
      const totalUsersCount = UsersStat.totalUsers || 0
      
      setUsers(users)
      setTotalUsers(totalUsersCount)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [tableState])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        search: e.target.value,
      },
      pagination: {
        ...prev.pagination,
        pageIndex: 0, // Reset to first page on new search
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

  const handlePageSizeChange = (pageSize: number) => {
    setTableState((prev) => ({
      ...prev,
      pagination: {
        pageIndex: 0, // Reset to first page when changing page size
        pageSize,
      },
    }))
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="default">Admin</Badge>
      case UserRole.TENANT:
        return <Badge variant="secondary">Tenant</Badge>
      case UserRole.PROPERTY_OWNER:
        return <Badge variant="outline">Owner</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Calculate pagination values
  const pageCount = Math.ceil(totalUsers / tableState.pagination.pageSize)
  const startItem = tableState.pagination.pageIndex * tableState.pagination.pageSize + 1
  const endItem = Math.min((tableState.pagination.pageIndex + 1) * tableState.pagination.pageSize, totalUsers)

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
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
            <div className="flex items-center gap-2">
              <Select
                value={tableState.pagination.pageSize.toString()}
                onValueChange={(value) => handlePageSizeChange(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
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
                      onClick={() => handleSort("name")}
                    >
                      User
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("email")}
                    >
                      Email
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email status</TableHead>
                  <TableHead>KYC status</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium"
                      onClick={() => handleSort("created_at")}
                    >
                      Joined
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
                            <div className="h-9 w-9 animate-pulse rounded-full bg-muted"></div>
                            <div className="space-y-1">
                              <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                              <div className="h-3 w-16 animate-pulse rounded bg-muted"></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : users && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users && users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={user.profile_picture || "/placeholder.svg"}
                              alt={`${user.first_name} ${user.last_name}`}
                            />
                            <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link to={`/admin/users/${user.id}`} className="font-medium hover:underline">
                              {`${user.first_name} ${user.last_name}`}
                            </Link>
                            <div className="text-sm text-muted-foreground">{user.username || user.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.is_verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Not Verified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.kyc_verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Not Verified</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/users/${user.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.kyc_verified ? ( 
                               <DropdownMenuItem className="text-yellow-600">Suspend User</DropdownMenuItem>
                            ) : (
                               <DropdownMenuItem className="text-green-600">Approve User</DropdownMenuItem>
                            )} */}
                            <DropdownMenuItem className="text-red-600">Deactivate User</DropdownMenuItem>
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
              {totalUsers > 0 ? (
                `Showing ${startItem} - ${endItem} of ${totalUsers} users`
              ) : (
                "No users found"
              )}
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
                disabled={tableState.pagination.pageIndex >= pageCount - 1}
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