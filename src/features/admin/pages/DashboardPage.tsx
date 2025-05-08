"use client"

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Flag,
  FolderTree,
  Home,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { cn } from "../../../lib/utils"
import { adminApi } from "../api/adminApi"
import { AdminLayout } from "../components/layout/AdminLayout"
import type { AdminAnalytics, AdminDashboardStats } from "../types"

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getDashboardStats()
      setStats(data)

      const analyticsData = await adminApi.getDashboardAnalytics(timeRange)
      setAnalytics(analyticsData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    fetchData()
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      description: `${stats?.newUsersThisMonth || 0} new this month`,
      icon: Users,
      trend: calculateTrend(stats?.newUsersThisMonth, stats?.totalUsers),
      trendUp: (stats?.newUsersThisMonth || 0) > 0,
      color: (stats?.newUsersThisMonth || 0) > 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Total Listings",
      value: stats?.totalListings || 0,
      description: `${stats?.newListingsThisMonth || 0} new this month`,
      icon: Home,
      trend: calculateTrend(stats?.newListingsThisMonth, stats?.totalListings),
      trendUp: (stats?.newListingsThisMonth || 0) > 0,
      color: (stats?.newListingsThisMonth || 0) > 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Active Listings",
      value: stats?.activeListings || 0,
      description: "Currently active",
      icon: TrendingUp,
      trend: calculateTrend(stats?.activeListings, stats?.totalListings),
      trendUp: true,
      color: "text-green-500",
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      description: "Total categories",
      icon: FolderTree,
      trend: 0,
      trendUp: true,
      color: "text-gray-500",
    },
    {
      title: "Total Reports",
      value: stats?.totalReports || 0,
      description: `${stats?.pendingReports || 0} pending reports`,
      icon: Flag,
      trend: calculateTrend(stats?.pendingReports, stats?.totalReports),
      trendUp: false,
      color: "text-red-500",
    },
    {
      title: "Bookings",
      value: stats?.totalBookings || 0,
      description: `${stats?.newBookingsThisMonth || 0} new this month`,
      icon: Calendar,
      trend: calculateTrend(stats?.newBookingsThisMonth, stats?.totalBookings),
      trendUp: (stats?.newBookingsThisMonth || 0) > 0,
      color: (stats?.newBookingsThisMonth || 0) > 0 ? "text-blue-500" : "text-red-500",
    },
    {
      title: "Revenue",
      value: `$${formatCurrency(stats?.totalRevenue || 0)}`,
      description: `$${formatCurrency(stats?.revenueThisMonth || 0)} this month`,
      icon: DollarSign,
      trend: calculateTrend(stats?.revenueThisMonth, stats?.totalRevenue),
      trendUp: (stats?.revenueThisMonth || 0) > 0,
      color: (stats?.revenueThisMonth || 0) > 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Verified Users",
      value: stats?.verifiedUsers || 0,
      description: `${calculatePercentage(stats?.verifiedUsers, stats?.totalUsers)}% of total users`,
      icon: UserCheck,
      trend: calculateTrend(stats?.verifiedUsers, stats?.totalUsers, true),
      trendUp: true,
      color: "text-green-500",
    },
  ]

  // Recent activities - this would ideally come from an API
  const recentActivities = [
    {
      type: "New user registered",
      time: "2 minutes ago",
      icon: Users,
    },
    {
      type: "New listing created",
      time: "15 minutes ago",
      icon: Home,
    },
    {
      type: "New report submitted",
      time: "1 hour ago",
      icon: Flag,
    },
    {
      type: "Category updated",
      time: "3 hours ago",
      icon: FolderTree,
    },
    {
      type: "User profile updated",
      time: "5 hours ago",
      icon: Users,
    },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-background p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {isDate(entry.value) ? entry.value.toLocaleString() : formatValue(entry.value ?? 0, entry.name ?? "")}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Custom pie chart label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12}>
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex flex-wrap items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              Refresh
            </button>
            <div className="text-sm text-gray-500">Last updated: {lastUpdated.toLocaleString()}</div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-700">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium">Error</h3>
                <div className="mt-2 text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div> : card.value.toString()}
                </div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
                {card.trend > 0 && (
                  <div className="mt-2 flex items-center text-xs">
                    {card.trendUp ? (
                      <>
                        <ArrowUpRight className={cn("mr-1 h-3 w-3", card.color)} />
                        <span className={card.color}>{card.trend}% increase</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className={cn("mr-1 h-3 w-3", card.color)} />
                        <span className={card.color}>{card.trend}% decrease</span>
                      </>
                    )}
                    <span className="ml-1 text-gray-500">from last month</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.userGrowth || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="users"
                          name="New Users"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Listings by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Listings by Category</CardTitle>
                  <CardDescription>Distribution of listings across categories</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.listingsByCategory || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(analytics?.listingsByCategory || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Bookings and revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.bookingTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="bookings" fill="#8884d8" name="Bookings" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* User Registration Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Registrations</CardTitle>
                  <CardDescription>Monthly user registrations</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.userGrowth || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="users" fill="#8884d8" name="New Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* User Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>User Demographics</CardTitle>
                  <CardDescription>User distribution by role</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Renters", value: analytics?.usersByRole?.renter || 0 },
                            { name: "Owners", value: analytics?.usersByRole?.owner || 0 },
                            { name: "Admins", value: analytics?.usersByRole?.admin || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#0088FE" />
                          <Cell fill="#00C49F" />
                          <Cell fill="#FFBB28" />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Listings by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Listings by Status</CardTitle>
                  <CardDescription>Distribution of listings by status</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Available", value: analytics?.listingsByStatus?.available || 0 },
                            { name: "Booked", value: analytics?.listingsByStatus?.booked || 0 },
                            { name: "Inactive", value: analytics?.listingsByStatus?.inactive || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#00C49F" />
                          <Cell fill="#0088FE" />
                          <Cell fill="#FF8042" />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>Most popular listing categories</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics?.listingsByCategory?.slice(0, 5).sort((a, b) => b.value - a.value) || []}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Listings" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity and Alerts */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Recent Activity */}
          <Card className="col-span-full lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <activity.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.pendingReports && stats.pendingReports > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">High number of pending reports</p>
                      <p className="text-xs text-gray-500">{stats.pendingReports} reports need review</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">KYC verification backlog</p>
                    <p className="text-xs text-gray-500">
                      {stats?.totalUsers && stats?.verifiedUsers ? stats.totalUsers - stats.verifiedUsers : 15} users
                      awaiting verification
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">System maintenance scheduled</p>
                    <p className="text-xs text-gray-500">Tomorrow at 2:00 AM UTC</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

// Helper functions for data formatting and calculations

// Format currency values
function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// Calculate percentage
function calculatePercentage(value?: number, total?: number): number {
  if (!value || !total || total === 0) return 0
  return Math.round((value / total) * 100)
}

// Calculate trend percentage
function calculateTrend(current?: number, total?: number, isPercentage = false): number {
  if (!current || !total) return 0

  if (isPercentage) {
    return calculatePercentage(current, total)
  }

  // Calculate percentage of new items compared to total
  return Math.round((current / total) * 100)
}

// Format values for tooltips
function formatValue(value: number, name: string): string {
  if (name.toLowerCase().includes("revenue")) {
    return `$${formatCurrency(value)}`
  }
  return value.toString()
}

function isDate(value: unknown): value is Date {
  return Object.prototype.toString.call(value) === "[object Date]";
}